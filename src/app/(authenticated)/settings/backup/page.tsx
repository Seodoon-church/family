"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { exportFullBackup, downloadBackup } from "@/lib/backup/export";
import { importFromBackup, parseManifest } from "@/lib/backup/import";
import { exportAsHtml } from "@/lib/backup/html-export";
import { Button } from "@/components/ui/button";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { GoldCorners } from "@/components/book/gold-corners";
import {
  Download, Upload, Shield, AlertTriangle, CheckCircle,
  ArrowLeft, FileArchive, HardDrive, Globe,
} from "lucide-react";
import type { ExportOptions, ImportOptions, BackupManifest, ImportResult } from "@/types/backup";
import JSZip from "jszip";

type ExportState = "idle" | "exporting" | "done" | "error";
type ImportState = "idle" | "preview" | "importing" | "done" | "error";

export default function BackupPage() {
  const { user, userProfile } = useAuth();
  const familyId = userProfile?.familyId;

  // Export state
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [includeMedia, setIncludeMedia] = useState(true);
  const [includeMessages, setIncludeMessages] = useState(true);

  // Import state
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState("");
  const [importManifest, setImportManifest] = useState<BackupManifest | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mergeMode, setMergeMode] = useState<"merge" | "overwrite">("merge");
  const [importMedia, setImportMedia] = useState(true);

  // HTML export state
  const [htmlExportState, setHtmlExportState] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const [htmlProgress, setHtmlProgress] = useState(0);
  const [htmlMessage, setHtmlMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!familyId || !user) return null;

  // 백업 실행
  const handleExport = async () => {
    setExportState("exporting");
    setExportProgress(0);

    try {
      const options: ExportOptions = {
        includeMedia,
        includeMessages,
        mediaQuality: "original",
      };

      const blob = await exportFullBackup(
        familyId,
        user.uid,
        userProfile?.displayName || "",
        userProfile?.email || user.email || "",
        options,
        (progress, message) => {
          setExportProgress(progress);
          setExportMessage(message);
        }
      );

      downloadBackup(blob, userProfile?.displayName || "가족");
      setExportState("done");
    } catch (err) {
      console.error("Backup export failed:", err);
      setExportState("error");
      setExportMessage("백업 생성에 실패했습니다.");
    }
  };

  // HTML 내보내기
  const handleHtmlExport = async () => {
    setHtmlExportState("exporting");
    setHtmlProgress(0);
    try {
      await exportAsHtml(familyId, (progress, message) => {
        setHtmlProgress(progress);
        setHtmlMessage(message);
      });
      setHtmlExportState("done");
    } catch (err) {
      console.error("HTML export failed:", err);
      setHtmlExportState("error");
      setHtmlMessage("HTML 내보내기에 실패했습니다.");
    }
  };

  // 파일 선택 시 미리보기
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportState("preview");

    try {
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("manifest.json");
      if (!manifestFile) {
        setImportMessage("유효하지 않은 백업 파일입니다 (manifest.json 없음).");
        setImportState("error");
        return;
      }
      const manifestJson = await manifestFile.async("text");
      const manifest = parseManifest(manifestJson);
      if (!manifest) {
        setImportMessage("매니페스트를 파싱할 수 없습니다.");
        setImportState("error");
        return;
      }
      setImportManifest(manifest);
    } catch {
      setImportMessage("ZIP 파일을 읽을 수 없습니다.");
      setImportState("error");
    }
  };

  // 복원 실행
  const handleImport = async () => {
    if (!importFile) return;

    if (!confirm("정말 복원하시겠습니까? 기존 데이터가 영향을 받을 수 있습니다.")) return;

    setImportState("importing");
    setImportProgress(0);

    try {
      const options: ImportOptions = {
        mergeMode,
        importMedia,
      };

      const result = await importFromBackup(
        importFile,
        familyId,
        options,
        (progress, message) => {
          setImportProgress(progress);
          setImportMessage(message);
        }
      );

      setImportResult(result);
      setImportState("done");
    } catch (err) {
      console.error("Backup import failed:", err);
      setImportState("error");
      setImportMessage("복원에 실패했습니다.");
    }
  };

  const resetImport = () => {
    setImportState("idle");
    setImportManifest(null);
    setImportFile(null);
    setImportResult(null);
    setImportMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <a
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          설정으로 돌아가기
        </a>
      </div>

      <ChapterHeader
        title="백업 및 복원"
        subtitle="소중한 가족 데이터를 안전하게 보관하세요"
      />

      {/* 백업 (내보내기) 섹션 */}
      <div className="relative bg-card rounded-xl border border-border warm-shadow p-6 mb-6">
        <GoldCorners size={20} className="absolute inset-0 pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">데이터 백업</h2>
            <p className="text-xs text-muted">가족 데이터를 ZIP 파일로 다운로드합니다</p>
          </div>
        </div>

        {/* 옵션 */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeMedia}
              onChange={(e) => setIncludeMedia(e.target.checked)}
              className="accent-primary"
            />
            미디어 파일 포함 (사진/영상)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeMessages}
              onChange={(e) => setIncludeMessages(e.target.checked)}
              className="accent-primary"
            />
            대화 기록 포함
          </label>
        </div>

        {/* 진행률 */}
        {exportState === "exporting" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{exportMessage}</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {exportState === "done" && (
          <div className="flex items-center gap-2 text-sm text-accent-green mb-4">
            <CheckCircle className="w-4 h-4" />
            백업 파일이 다운로드되었습니다!
          </div>
        )}

        {exportState === "error" && (
          <div className="flex items-center gap-2 text-sm text-accent-red mb-4">
            <AlertTriangle className="w-4 h-4" />
            {exportMessage}
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={exportState === "exporting"}
          className="w-full"
        >
          <HardDrive className="w-4 h-4 mr-2" />
          {exportState === "exporting" ? "백업 중..." : "지금 백업하기"}
        </Button>
      </div>

      {/* HTML 내보내기 섹션 */}
      <div className="relative bg-card rounded-xl border border-border warm-shadow p-6 mb-6">
        <GoldCorners size={20} className="absolute inset-0 pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">HTML로 내보내기</h2>
            <p className="text-xs text-muted">오프라인에서 열람 가능한 HTML 파일을 생성합니다</p>
          </div>
        </div>

        {htmlExportState === "exporting" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{htmlMessage}</span>
              <span>{Math.round(htmlProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full transition-all duration-300"
                style={{ width: `${htmlProgress}%` }}
              />
            </div>
          </div>
        )}

        {htmlExportState === "done" && (
          <div className="flex items-center gap-2 text-sm text-accent-green mb-4">
            <CheckCircle className="w-4 h-4" />
            HTML 파일이 다운로드되었습니다!
          </div>
        )}

        {htmlExportState === "error" && (
          <div className="flex items-center gap-2 text-sm text-accent-red mb-4">
            <AlertTriangle className="w-4 h-4" />
            {htmlMessage}
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleHtmlExport}
          disabled={htmlExportState === "exporting"}
          className="w-full"
        >
          <Globe className="w-4 h-4 mr-2" />
          {htmlExportState === "exporting" ? "생성 중..." : "HTML 파일 생성"}
        </Button>
      </div>

      <OrnamentDivider className="mb-6" />

      {/* 복원 (가져오기) 섹션 */}
      <div className="relative bg-card rounded-xl border border-border warm-shadow p-6 mb-6">
        <GoldCorners size={20} className="absolute inset-0 pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">데이터 복원</h2>
            <p className="text-xs text-muted">백업 ZIP 파일에서 데이터를 복원합니다</p>
          </div>
        </div>

        {/* 파일 업로드 */}
        {importState === "idle" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file"
            />
            <label
              htmlFor="backup-file"
              className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <FileArchive className="w-10 h-10 text-muted mb-2" />
              <span className="text-sm text-foreground font-medium">ZIP 파일을 선택하세요</span>
              <span className="text-xs text-muted mt-1">백업 파일 (.zip)</span>
            </label>
          </div>
        )}

        {/* 미리보기 */}
        {importState === "preview" && importManifest && (
          <div className="space-y-4">
            <div className="bg-primary-light rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">백업 정보</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-foreground/80">
                <div>가족: <strong>{importManifest.familyName}</strong></div>
                <div>백업일: <strong>{new Date(importManifest.createdAt).toLocaleDateString("ko-KR")}</strong></div>
                <div>구성원: <strong>{importManifest.stats.memberCount}명</strong></div>
                <div>이야기: <strong>{importManifest.stats.storyCount}편</strong></div>
                <div>미디어: <strong>{importManifest.stats.mediaCount}개</strong></div>
                <div>이벤트: <strong>{importManifest.stats.eventCount}건</strong></div>
                {importManifest.stats.messageCount > 0 && (
                  <div>대화: <strong>{importManifest.stats.messageCount}건</strong></div>
                )}
              </div>
            </div>

            {/* 복원 옵션 */}
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">복원 모드</label>
                <select
                  value={mergeMode}
                  onChange={(e) => setMergeMode(e.target.value as "merge" | "overwrite")}
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="merge">병합 (기존 데이터 유지 + 새 데이터 추가)</option>
                  <option value="overwrite">덮어쓰기 (같은 ID는 교체)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={importMedia}
                  onChange={(e) => setImportMedia(e.target.checked)}
                  className="accent-primary"
                />
                미디어 파일 복원
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetImport} className="flex-1">
                취소
              </Button>
              <Button onClick={handleImport} className="flex-1">
                복원 시작
              </Button>
            </div>
          </div>
        )}

        {/* 진행률 */}
        {importState === "importing" && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{importMessage}</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-blue rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 결과 */}
        {importState === "done" && importResult && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-sm ${importResult.success ? "text-accent-green" : "text-accent-red"}`}>
              {importResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {importResult.success ? "복원 완료!" : "복원 중 일부 오류 발생"}
            </div>
            <div className="bg-primary-light rounded-lg p-3 text-xs space-y-1">
              <div>구성원: {importResult.stats.membersImported}명 복원</div>
              <div>관계: {importResult.stats.relationshipsImported}건 복원</div>
              <div>이야기: {importResult.stats.storiesImported}편 복원</div>
              <div>이벤트: {importResult.stats.eventsImported}건 복원</div>
              <div>미디어: {importResult.stats.mediaImported}개 복원</div>
              {importResult.stats.messagesImported > 0 && (
                <div>대화: {importResult.stats.messagesImported}건 복원</div>
              )}
              {importResult.stats.skipped > 0 && (
                <div className="text-muted">건너뜀: {importResult.stats.skipped}건</div>
              )}
            </div>
            {importResult.stats.errors.length > 0 && (
              <div className="text-xs text-accent-red">
                {importResult.stats.errors.slice(0, 3).map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={resetImport} className="w-full">
              확인
            </Button>
          </div>
        )}

        {importState === "error" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-accent-red">
              <AlertTriangle className="w-4 h-4" />
              {importMessage}
            </div>
            <Button variant="outline" onClick={resetImport} className="w-full">
              다시 시도
            </Button>
          </div>
        )}
      </div>

      {/* 안전 가이드 */}
      <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-accent-gold" />
          <h3 className="font-semibold text-sm text-foreground">백업 안전 가이드</h3>
        </div>
        <ul className="text-xs text-foreground/70 space-y-1.5">
          <li>- 분기별 백업을 권장합니다 (3개월에 1회)</li>
          <li>- 백업 파일을 USB, 외장하드, 클라우드 등 안전한 곳에 보관하세요</li>
          <li>- 복원 전 현재 데이터를 먼저 백업해두세요</li>
          <li>- 백업 파일에는 가족 개인정보가 포함되어 있으므로 주의하세요</li>
        </ul>
      </div>
    </div>
  );
}
