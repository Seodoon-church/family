"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useMembers } from "@/hooks/use-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { TreeWizard } from "@/components/setup/tree-wizard";
import { Users, UserPlus, ArrowRight, ArrowLeft, Check, Copy } from "lucide-react";
import type { FamilyMember } from "@/types/family";

type Step = "choose" | "create" | "join" | "register" | "tree-builder" | "done";

export default function SetupPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");

  // Family creation
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [createdFamilyId, setCreatedFamilyId] = useState<string | undefined>();
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  // Join family
  const [joinCode, setJoinCode] = useState("");

  // Member registration
  const [memberName, setMemberName] = useState(userProfile?.displayName || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [birthDate, setBirthDate] = useState("");
  const [generation, setGeneration] = useState(1);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { createFamily, joinFamily, family } = useFamily(createdFamilyId || userProfile?.familyId);
  const { addMember } = useMembers(createdFamilyId || userProfile?.familyId);

  // If user already has familyId and memberId, go to tree-builder
  // If user already has familyId but no memberId, go to register
  useEffect(() => {
    if (userProfile?.familyId && step === "choose") {
      if (userProfile.memberId) {
        setStep("tree-builder");
      } else {
        setStep("register");
      }
    }
  }, [userProfile?.familyId, userProfile?.memberId, step]);

  // Update memberName when userProfile loads
  useEffect(() => {
    if (userProfile?.displayName && !memberName) {
      setMemberName(userProfile.displayName);
    }
  }, [userProfile?.displayName, memberName]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="불러오는 중..." />
      </div>
    );
  }

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError("가족 이름을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const newFamilyId = await createFamily(familyName.trim(), user.uid);
      setCreatedFamilyId(newFamilyId);
      await refreshProfile();

      // Fetch the created family's invite code
      const { getDoc, doc } = await import("firebase/firestore");
      const famDoc = await getDoc(doc(getFirebaseDb(), "families", newFamilyId));
      if (famDoc.exists()) {
        setGeneratedCode(famDoc.data().inviteCode || "");
      }

      setStep("register");
    } catch {
      setError("가족 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!joinCode.trim() || joinCode.trim().length < 6) {
      setError("6자리 초대코드를 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const joinedFamilyId = await joinFamily(joinCode.trim(), user.uid);
      setCreatedFamilyId(joinedFamilyId);
      await refreshProfile();
      setStep("register");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "가입에 실패했습니다. 초대코드를 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterMember = async () => {
    if (!memberName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    const familyId = createdFamilyId || userProfile?.familyId;
    if (!familyId) {
      setError("가족 정보를 찾을 수 없습니다.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const memberId = await addMember({
        nameKorean: memberName.trim(),
        gender,
        birthDate: birthDate ? Timestamp.fromDate(new Date(birthDate)) : undefined,
        isAlive: true,
        generation: generation - 1, // UI shows 1-based, store 0-based
        birthOrder: 1,
        linkedUserId: user.uid,
      } as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">);

      // Link member to user profile
      if (memberId) {
        await updateDoc(doc(getFirebaseDb(), "users", user.uid), {
          memberId,
        });
      }

      await refreshProfile();
      setStep("tree-builder");
    } catch {
      setError("구성원 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className={`w-full ${step === "tree-builder" ? "max-w-xl" : "max-w-md"}`}>
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["choose", "create/join", "register", "tree-builder", "done"].map((s, i) => {
            const stepNames = ["choose", "create", "register", "tree-builder", "done"];
            const currentIndex = stepNames.indexOf(step === "join" ? "create" : step);
            const isActive = i <= currentIndex;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < currentIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 4 && (
                  <div className={`w-8 h-0.5 ${isActive ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Tree Builder Step (outside the card - has its own styling) */}
        {step === "tree-builder" && userProfile?.memberId && (
          <div className="space-y-4">
            <TreeWizard
              familyId={(createdFamilyId || userProfile?.familyId)!}
              selfId={userProfile.memberId}
              selfGeneration={generation - 1}
              selfGender={gender}
              familySurname={family?.surname}
              onComplete={() => setStep("done")}
            />
            <button
              onClick={() => setStep("done")}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              나중에 등록하기
            </button>
          </div>
        )}

        {step !== "tree-builder" && (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7">
          {/* Step: Choose */}
          {step === "choose" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">가족 설정</h2>
                <p className="text-sm text-gray-500">
                  새 가족을 만들거나, 초대코드로 기존 가족에 합류하세요.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setStep("create"); setError(""); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">새 가족 만들기</p>
                    <p className="text-xs text-gray-500">관리자로서 가족을 새로 생성합니다</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => { setStep("join"); setError(""); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <UserPlus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">초대코드로 가입</p>
                    <p className="text-xs text-gray-500">가족 관리자에게 받은 코드로 합류합니다</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* Step: Create Family */}
          {step === "create" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">새 가족 만들기</h2>
                <p className="text-sm text-gray-500">
                  가족의 이름을 정해주세요. (예: 김해 김씨 가족)
                </p>
              </div>

              <Input
                id="familyName"
                label="가족 이름"
                placeholder="예: 김해 김씨 가족, 홍길동네 가족"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />

              {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("choose")} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  이전
                </Button>
                <Button onClick={handleCreateFamily} disabled={submitting} className="flex-1">
                  {submitting ? "생성 중..." : "가족 만들기"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Join Family */}
          {step === "join" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">초대코드로 가입</h2>
                <p className="text-sm text-gray-500">
                  가족 관리자에게 받은 6자리 코드를 입력하세요.
                </p>
              </div>

              <Input
                id="joinCode"
                label="초대코드"
                placeholder="예: ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />

              {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("choose")} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  이전
                </Button>
                <Button onClick={handleJoinFamily} disabled={submitting} className="flex-1">
                  {submitting ? "가입 중..." : "가입하기"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Register Member */}
          {step === "register" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">본인 정보 등록</h2>
                <p className="text-sm text-gray-500">
                  가계도에 등록할 본인의 기본 정보를 입력하세요.
                </p>
              </div>

              {/* Show invite code if just created */}
              {generatedCode && (
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">가족 초대코드</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                      {generatedCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      title="복사"
                    >
                      {codeCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">이 코드를 가족에게 공유하세요</p>
                </div>
              )}

              <Input
                id="memberName"
                label="이름 (한글) *"
                placeholder="홍길동"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                required
              />

              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">성별 *</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="setup-gender"
                      checked={gender === "MALE"}
                      onChange={() => setGender("MALE")}
                      className="accent-primary"
                    />
                    <span className="text-sm">남성</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="setup-gender"
                      checked={gender === "FEMALE"}
                      onChange={() => setGender("FEMALE")}
                      className="accent-rose-500"
                    />
                    <span className="text-sm">여성</span>
                  </label>
                </div>
              </div>

              <Input
                id="birthDate"
                label="생년월일"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">세대</label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>{g}세대</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

              <Button onClick={handleRegisterMember} disabled={submitting} className="w-full">
                {submitting ? "등록 중..." : "등록 완료"}
              </Button>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="space-y-6 text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">설정 완료!</h2>
                <p className="text-sm text-gray-500">
                  모든 준비가 끝났습니다. 가족의 이야기를 시작하세요.
                </p>
              </div>

              {generatedCode && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-medium mb-1">잊지 마세요!</p>
                  <p className="text-sm text-amber-600">
                    가족 초대코드 <span className="font-mono font-bold">{generatedCode}</span>를
                    다른 가족에게 공유하세요.
                  </p>
                </div>
              )}

              <Button onClick={handleComplete} size="lg" className="w-full">
                대시보드로 이동
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
