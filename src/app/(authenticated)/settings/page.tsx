"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { useRelationships } from "@/hooks/use-relationships";
import { useFamily } from "@/hooks/use-family";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberForm } from "@/components/member/member-form";
import { Avatar } from "@/components/ui/avatar";
import { Settings, Users, User, UserPlus, Shield, Copy, Check, RefreshCw, KeyRound, BookOpen } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { FamilyMember } from "@/types/family";

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const { members, addMember } = useMembers(userProfile?.familyId);
  const { addRelationship } = useRelationships(userProfile?.familyId);
  const { family, regenerateInviteCode, updateFamily } = useFamily(userProfile?.familyId);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // 족보 정보
  const [clanSurname, setClanSurname] = useState(family?.surname || "");
  const [clanOrigin, setClanOrigin] = useState(family?.clan || "");
  const [clanBranch, setClanBranch] = useState(family?.branch || "");
  const [refGeneration, setRefGeneration] = useState(family?.referenceGeneration ?? 0);
  const [refGenCount, setRefGenCount] = useState(family?.referenceGenerationCount ?? 0);
  const [clanSaving, setClanSaving] = useState(false);
  const [clanMsg, setClanMsg] = useState("");

  // family 데이터 로드 시 state 동기화
  useEffect(() => {
    if (family) {
      setClanSurname(family.surname || "");
      setClanOrigin(family.clan || "");
      setClanBranch(family.branch || "");
      setRefGeneration(family.referenceGeneration ?? 0);
      setRefGenCount(family.referenceGenerationCount ?? 0);
    }
  }, [family]);

  const handleSaveClanInfo = async () => {
    setClanSaving(true);
    setClanMsg("");
    try {
      await updateFamily({
        surname: clanSurname,
        clan: clanOrigin,
        branch: clanBranch,
        referenceGeneration: refGeneration,
        referenceGenerationCount: refGenCount,
      });
      setClanMsg("저장되었습니다.");
      setTimeout(() => setClanMsg(""), 2000);
    } catch {
      setClanMsg("저장에 실패했습니다.");
    } finally {
      setClanSaving(false);
    }
  };
  const isAdmin = userProfile?.role === "ADMIN";

  const handleCopyCode = () => {
    if (family?.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    try {
      await regenerateInviteCode();
    } finally {
      setRegenerating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      setPasswordMsg("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setChangingPassword(true);
    setPasswordMsg("");

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMsg("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMsg("현재 비밀번호가 올바르지 않습니다.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddMember = async (data: Partial<FamilyMember>, relation?: { memberId: string; type: "SPOUSE" | "PARENT_CHILD" }) => {
    const docId = await addMember(data as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">);
    if (relation && docId) {
      if (relation.type === "SPOUSE") {
        await addRelationship(relation.memberId, docId, "SPOUSE");
      } else {
        await addRelationship(relation.memberId, docId, "PARENT_CHILD");
      }
    }
    setShowMemberForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">설정</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              내 계정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={userProfile?.displayName || ""}
                src={userProfile?.profileImage}
                size="lg"
              />
              <div>
                <p className="font-semibold text-gray-900">{userProfile?.displayName}</p>
                <p className="text-sm text-gray-500">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-gray-600">{isAdmin ? "관리자" : "구성원"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Settings className="w-4 h-4 text-amber-600" />
              </div>
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              id="current-password"
              type="password"
              label="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
            />
            <Input
              id="new-password"
              type="password"
              label="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (6자 이상)"
            />
            {passwordMsg && (
              <p className={`text-xs ${passwordMsg.includes("변경") ? "text-emerald-600" : "text-rose-600"}`}>
                {passwordMsg}
              </p>
            )}
            <Button
              size="sm"
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword}
            >
              {changingPassword ? "변경 중..." : "변경"}
            </Button>
          </CardContent>
        </Card>

        {/* Invite Code (Admin only) */}
        {isAdmin && family?.inviteCode && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                </div>
                가족 초대코드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">초대코드</p>
                  <p className="text-3xl font-mono font-bold text-primary tracking-[0.3em]">
                    {family.inviteCode}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">이 코드를 가족에게 공유하세요</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyCode}>
                    {codeCopied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
                    {codeCopied ? "복사됨" : "복사"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRegenerateCode} disabled={regenerating}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${regenerating ? "animate-spin" : ""}`} />
                    재생성
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clan Info (Admin only) */}
        {isAdmin && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                </div>
                족보 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-400">
                성씨와 본관, 기준 세대의 대손을 입력하면 다른 세대의 대손이 자동 계산됩니다.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  id="clanSurname"
                  label="성씨"
                  value={clanSurname}
                  onChange={(e) => setClanSurname(e.target.value)}
                  placeholder="한"
                />
                <Input
                  id="clanOrigin"
                  label="본관"
                  value={clanOrigin}
                  onChange={(e) => setClanOrigin(e.target.value)}
                  placeholder="청주"
                />
                <Input
                  id="clanBranch"
                  label="파"
                  value={clanBranch}
                  onChange={(e) => setClanBranch(e.target.value)}
                  placeholder="충의공파"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">기준 세대 (나의 세대)</label>
                  <select
                    value={refGeneration}
                    onChange={(e) => setRefGeneration(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[0, 1, 2, 3, 4, 5].map((g) => (
                      <option key={g} value={g}>{g + 1}세대</option>
                    ))}
                  </select>
                </div>
                <Input
                  id="refGenCount"
                  label="기준 대손 (나는 몇 대손)"
                  type="number"
                  min={1}
                  value={refGenCount}
                  onChange={(e) => setRefGenCount(Number(e.target.value))}
                  placeholder="26"
                />
              </div>
              {refGenCount > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">자동 계산 미리보기</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5].map((g) => {
                      const count = refGenCount + (g - refGeneration);
                      return (
                        <span key={g} className={`text-xs px-2.5 py-1 rounded-lg ${g === refGeneration ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                          {g + 1}세대 = {count > 0 ? `${count}대손` : "-"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleSaveClanInfo} disabled={clanSaving}>
                  {clanSaving ? "저장 중..." : "저장"}
                </Button>
                {clanMsg && (
                  <p className={`text-xs ${clanMsg.includes("저장되") ? "text-emerald-600" : "text-rose-600"}`}>
                    {clanMsg}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Management (Admin only) */}
        {isAdmin && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                가족 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  등록된 구성원: <span className="font-bold text-gray-900">{members.length}명</span>
                </p>
                <Button size="sm" onClick={() => setShowMemberForm(true)}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  구성원 추가
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
                    <Avatar name={m.nameKorean} gender={m.gender} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.nameKorean}</p>
                      <p className="text-[10px] text-gray-400">{m.generation + 1}세대</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showMemberForm && (
        <MemberForm
          existingMembers={members}
          family={family}
          onSubmit={handleAddMember}
          onCancel={() => setShowMemberForm(false)}
        />
      )}
    </div>
  );
}
