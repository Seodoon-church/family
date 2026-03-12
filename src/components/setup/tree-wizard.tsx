"use client";

import { useState } from "react";
import { useTreeWizard, type WizardMemberInput, type WizardStep } from "@/hooks/use-tree-wizard";
import { useMembers } from "@/hooks/use-members";
import { useRelationships } from "@/hooks/use-relationships";
import { useTreeData } from "@/hooks/use-tree-data";
import { ModernTree } from "@/components/tree/modern-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart, ArrowLeft, ArrowRight, UserPlus, Plus,
  Users, TreePine, Baby, Check, SkipForward,
} from "lucide-react";

interface TreeWizardProps {
  familyId: string;
  selfId: string;
  selfGeneration: number;
  selfGender: "MALE" | "FEMALE";
  familySurname?: string;
  onComplete: () => void;
}

const STEP_INFO: Record<WizardStep, { icon: typeof Heart; title: string; description: string; color: string }> = {
  spouse: {
    icon: Heart,
    title: "배우자",
    description: "결혼하셨나요?",
    color: "text-rose-500",
  },
  father: {
    icon: Users,
    title: "아버지",
    description: "아버지 정보를 입력해주세요",
    color: "text-sky-600",
  },
  mother: {
    icon: Users,
    title: "어머니",
    description: "어머니 정보를 입력해주세요",
    color: "text-pink-500",
  },
  siblings: {
    icon: UserPlus,
    title: "형제 / 자매",
    description: "형제나 자매가 있나요?",
    color: "text-emerald-600",
  },
  children: {
    icon: Baby,
    title: "자녀",
    description: "자녀가 있나요?",
    color: "text-amber-600",
  },
  preview: {
    icon: TreePine,
    title: "가계도 완성!",
    description: "등록한 가족을 확인해보세요",
    color: "text-primary",
  },
};

const STEPS: WizardStep[] = ["spouse", "father", "mother", "siblings", "children", "preview"];

export function TreeWizard({
  familyId,
  selfId,
  selfGeneration,
  selfGender,
  familySurname,
  onComplete,
}: TreeWizardProps) {
  const wizard = useTreeWizard(familyId, selfId, selfGeneration, selfGender);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= wizard.stepIndex
                ? "bg-primary w-8"
                : "bg-gray-200 w-5"
            }`}
          />
        ))}
      </div>

      {/* Step Header */}
      <StepHeader step={wizard.state.currentStep} />

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {wizard.state.currentStep === "spouse" && (
          <SpouseStep
            selfGender={selfGender}
            onAdd={wizard.addSpouse}
            onNext={wizard.nextStep}
            submitting={wizard.submitting}
          />
        )}
        {wizard.state.currentStep === "father" && (
          <ParentStep
            role="father"
            onAdd={wizard.addFather}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
            submitting={wizard.submitting}
          />
        )}
        {wizard.state.currentStep === "mother" && (
          <ParentStep
            role="mother"
            onAdd={wizard.addMother}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
            submitting={wizard.submitting}
          />
        )}
        {wizard.state.currentStep === "siblings" && (
          <SiblingsStep
            selfGender={selfGender}
            siblingCount={wizard.state.siblingIds.length}
            onAdd={wizard.addSibling}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
            submitting={wizard.submitting}
          />
        )}
        {wizard.state.currentStep === "children" && (
          <ChildrenStep
            childCount={wizard.state.childIds.length}
            onAdd={wizard.addChild}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
            submitting={wizard.submitting}
          />
        )}
        {wizard.state.currentStep === "preview" && (
          <PreviewStep
            familyId={familyId}
            familySurname={familySurname}
            onComplete={onComplete}
            onBack={wizard.prevStep}
          />
        )}
      </div>
    </div>
  );
}

/* ── Step Header ────────────────────────────── */

function StepHeader({ step }: { step: WizardStep }) {
  const info = STEP_INFO[step];
  const Icon = info.icon;

  return (
    <div className="text-center space-y-2">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 ${info.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{info.title}</h2>
      <p className="text-sm text-gray-500">{info.description}</p>
    </div>
  );
}

/* ── Member Input Form (reusable) ───────────── */

interface MemberInputProps {
  nameLabel?: string;
  namePlaceholder?: string;
  showGender?: boolean;
  defaultGender?: "MALE" | "FEMALE";
  value: WizardMemberInput;
  onChange: (data: WizardMemberInput) => void;
}

function MemberInput({
  nameLabel = "이름 (한글)",
  namePlaceholder = "홍길동",
  showGender = true,
  defaultGender,
  value,
  onChange,
}: MemberInputProps) {
  return (
    <div className="space-y-4">
      <Input
        id="wizard-name"
        label={nameLabel}
        placeholder={namePlaceholder}
        value={value.nameKorean}
        onChange={(e) => onChange({ ...value, nameKorean: e.target.value })}
        required
      />

      {showGender && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">성별</label>
          <div className="flex gap-3">
            <label className="flex-1 relative cursor-pointer">
              <input
                type="radio"
                name="wizard-gender"
                checked={value.gender === "MALE"}
                onChange={() => onChange({ ...value, gender: "MALE" })}
                className="peer sr-only"
              />
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-gray-100 peer-checked:border-sky-400 peer-checked:bg-sky-50 transition-all">
                <span className="text-sm font-medium">남성</span>
              </div>
            </label>
            <label className="flex-1 relative cursor-pointer">
              <input
                type="radio"
                name="wizard-gender"
                checked={value.gender === "FEMALE"}
                onChange={() => onChange({ ...value, gender: "FEMALE" })}
                className="peer sr-only"
              />
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-gray-100 peer-checked:border-rose-400 peer-checked:bg-rose-50 transition-all">
                <span className="text-sm font-medium">여성</span>
              </div>
            </label>
          </div>
        </div>
      )}

      <Input
        id="wizard-birthdate"
        label="생년월일"
        type="date"
        value={value.birthDate || ""}
        onChange={(e) => onChange({ ...value, birthDate: e.target.value })}
      />
    </div>
  );
}

/* ── Spouse Step ─────────────────────────────── */

function SpouseStep({
  selfGender,
  onAdd,
  onNext,
  submitting,
}: {
  selfGender: "MALE" | "FEMALE";
  onAdd: (data: WizardMemberInput) => Promise<string | undefined>;
  onNext: () => void;
  submitting: boolean;
}) {
  const [isMarried, setIsMarried] = useState<boolean | null>(null);
  const [form, setForm] = useState<WizardMemberInput>({
    nameKorean: "",
    gender: selfGender === "MALE" ? "FEMALE" : "MALE",
  });

  if (isMarried === null) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsMarried(true)}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-100 hover:border-rose-300 hover:bg-rose-50/50 transition-all"
          >
            <Heart className="w-8 h-8 text-rose-400" />
            <span className="text-sm font-semibold text-gray-900">예, 기혼입니다</span>
          </button>
          <button
            onClick={() => { setIsMarried(false); onNext(); }}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <SkipForward className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">아니요, 건너뛰기</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.nameKorean.trim()) return;
    await onAdd(form);
    onNext();
  };

  return (
    <div className="p-6 space-y-5">
      <MemberInput
        nameLabel="배우자 이름"
        showGender={false}
        value={form}
        onChange={setForm}
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setIsMarried(null)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-1" />
          이전
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!form.nameKorean.trim() || submitting}
          className="flex-1"
        >
          {submitting ? "등록 중..." : "등록"}
          {!submitting && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}

/* ── Parent Step (Father / Mother) ───────────── */

function ParentStep({
  role,
  onAdd,
  onNext,
  onBack,
  submitting,
}: {
  role: "father" | "mother";
  onAdd: (data: WizardMemberInput) => Promise<string | undefined>;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<WizardMemberInput>({
    nameKorean: "",
    gender: role === "father" ? "MALE" : "FEMALE",
  });

  const handleSubmit = async () => {
    if (!form.nameKorean.trim()) return;
    await onAdd(form);
    onNext();
  };

  const label = role === "father" ? "아버지 이름" : "어머니 이름";

  return (
    <div className="p-6 space-y-5">
      <MemberInput
        nameLabel={label}
        showGender={false}
        value={form}
        onChange={setForm}
      />
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-1" />
          이전
        </Button>
        <Button variant="ghost" onClick={onNext} className="flex-1">
          건너뛰기
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!form.nameKorean.trim() || submitting}
          className="flex-1"
        >
          {submitting ? "등록 중..." : "등록"}
          {!submitting && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}

/* ── Siblings Step ───────────────────────────── */

function SiblingsStep({
  selfGender,
  siblingCount,
  onAdd,
  onNext,
  onBack,
  submitting,
}: {
  selfGender: "MALE" | "FEMALE";
  siblingCount: number;
  onAdd: (data: WizardMemberInput, spouseData?: WizardMemberInput) => Promise<string | undefined>;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [showForm, setShowForm] = useState(siblingCount === 0);
  const [form, setForm] = useState<WizardMemberInput>({
    nameKorean: "",
    gender: selfGender === "MALE" ? "MALE" : "FEMALE",
  });
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseForm, setSpouseForm] = useState<WizardMemberInput>({
    nameKorean: "",
    gender: "FEMALE",
  });

  const resetForm = () => {
    setForm({ nameKorean: "", gender: selfGender === "MALE" ? "MALE" : "FEMALE" });
    setHasSpouse(false);
    setSpouseForm({ nameKorean: "", gender: "FEMALE" });
  };

  const handleAdd = async () => {
    if (!form.nameKorean.trim()) return;
    const spouseData = hasSpouse && spouseForm.nameKorean.trim() ? spouseForm : undefined;
    await onAdd(form, spouseData);
    resetForm();
    setShowForm(false);
  };

  // 성별 변경시 배우자 성별 자동 반대
  const handleFormChange = (data: WizardMemberInput) => {
    setForm(data);
    if (hasSpouse) {
      setSpouseForm((prev) => ({
        ...prev,
        gender: data.gender === "MALE" ? "FEMALE" : "MALE",
      }));
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* 등록된 형제 목록 */}
      {siblingCount > 0 && (
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-sm text-emerald-700 font-medium">
            <Check className="w-4 h-4 inline mr-1" />
            형제/자매 {siblingCount}명 등록됨
          </p>
        </div>
      )}

      {showForm ? (
        <div className="space-y-4">
          <MemberInput
            nameLabel={`${siblingCount + 1}번째 형제/자매 이름`}
            value={form}
            onChange={handleFormChange}
          />

          {/* 배우자 포함 여부 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSpouse}
              onChange={(e) => {
                setHasSpouse(e.target.checked);
                if (e.target.checked) {
                  setSpouseForm((prev) => ({
                    ...prev,
                    gender: form.gender === "MALE" ? "FEMALE" : "MALE",
                  }));
                }
              }}
              className="rounded accent-primary"
            />
            <span className="text-sm text-gray-600">배우자도 함께 등록</span>
          </label>

          {hasSpouse && (
            <div className="pl-4 border-l-2 border-rose-200 space-y-4">
              <MemberInput
                nameLabel="배우자 이름"
                showGender={false}
                value={spouseForm}
                onChange={setSpouseForm}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!form.nameKorean.trim() || submitting}
              className="flex-1"
            >
              {submitting ? "등록 중..." : "등록"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
          >
            <Plus className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-600">형제/자매 추가</span>
          </button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            <Button onClick={onNext} className="flex-1">
              다음
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Children Step ───────────────────────────── */

function ChildrenStep({
  childCount,
  onAdd,
  onNext,
  onBack,
  submitting,
}: {
  childCount: number;
  onAdd: (data: WizardMemberInput) => Promise<string | undefined>;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [showForm, setShowForm] = useState(childCount === 0);
  const [form, setForm] = useState<WizardMemberInput>({
    nameKorean: "",
    gender: "MALE",
  });

  const resetForm = () => {
    setForm({ nameKorean: "", gender: "MALE" });
  };

  const handleAdd = async () => {
    if (!form.nameKorean.trim()) return;
    await onAdd(form);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-5">
      {childCount > 0 && (
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-sm text-amber-700 font-medium">
            <Check className="w-4 h-4 inline mr-1" />
            자녀 {childCount}명 등록됨
          </p>
        </div>
      )}

      {showForm ? (
        <div className="space-y-4">
          <MemberInput
            nameLabel={`${childCount + 1}번째 자녀 이름`}
            value={form}
            onChange={setForm}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!form.nameKorean.trim() || submitting}
              className="flex-1"
            >
              {submitting ? "등록 중..." : "등록"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
          >
            <Plus className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">자녀 추가</span>
          </button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            <Button onClick={onNext} className="flex-1">
              완료
              <TreePine className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Preview Step ─────────────────────────────── */

function PreviewStep({
  familyId,
  familySurname,
  onComplete,
  onBack,
}: {
  familyId: string;
  familySurname?: string;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { members } = useMembers(familyId);
  const { relationships } = useRelationships(familyId);
  const treeData = useTreeData(members, relationships, familySurname);

  return (
    <div className="space-y-4">
      {/* Tree Preview */}
      <div className="overflow-auto" style={{ maxHeight: "400px" }}>
        {treeData ? (
          <ModernTree data={treeData} />
        ) : (
          <div className="flex items-center justify-center p-10">
            <p className="text-sm text-gray-400">가계도 데이터를 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 pb-6 space-y-4">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-700 font-medium">
            총 {members.length}명의 가족이 등록되었습니다
          </p>
          <p className="text-xs text-emerald-500 mt-1">
            나중에 구성원 관리에서 상세 정보를 보완할 수 있습니다
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-1" />
            이전
          </Button>
          <Button onClick={onComplete} size="lg" className="flex-1">
            대시보드로 이동
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
