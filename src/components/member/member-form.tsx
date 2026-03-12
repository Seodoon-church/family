"use client";

import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { Family, FamilyMember } from "@/types/family";
import { X, Camera } from "lucide-react";

interface MemberFormProps {
  initialData?: Partial<FamilyMember>;
  existingMembers?: FamilyMember[];
  family?: Family | null;
  onSubmit: (data: Partial<FamilyMember>, relation?: { memberId: string; type: "SPOUSE" | "PARENT_CHILD" }) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function MemberForm({ initialData, existingMembers = [], family, onSubmit, onCancel, isEdit }: MemberFormProps) {
  const { userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nameKorean: initialData?.nameKorean || "",
    nameHanja: initialData?.nameHanja || "",
    gender: initialData?.gender || ("MALE" as "MALE" | "FEMALE"),
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate.toDate()).toISOString().split("T")[0]
      : "",
    birthDateLunar: initialData?.birthDateLunar || "",
    deathDate: initialData?.deathDate
      ? new Date(initialData.deathDate.toDate()).toISOString().split("T")[0]
      : "",
    isAlive: initialData?.isAlive ?? true,
    generation: initialData?.generation ?? 0,
    birthOrder: initialData?.birthOrder ?? 1,
    surname: initialData?.surname || "",
    clan: initialData?.clan || "",
    branch: initialData?.branch || "",
    generationName: initialData?.generationName || "",
    generationCount: initialData?.generationCount ?? 0,
    bio: initialData?.bio || "",
    occupation: initialData?.occupation || "",
    birthPlace: initialData?.birthPlace || "",
    currentPlace: initialData?.currentPlace || "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.profileImage || "");
  const [submitting, setSubmitting] = useState(false);
  const [relationType, setRelationType] = useState<"" | "SPOUSE" | "PARENT_CHILD">("");
  const [relationMemberId, setRelationMemberId] = useState("");

  // 세대 변경 시 대손 자동계산 + 족보 정보 자동채움 + 관계 자동설정
  const handleGenerationChange = (newGeneration: number) => {
    const updates: Partial<typeof formData> = { generation: newGeneration };

    // 대손 자동계산
    if (family?.referenceGenerationCount && family.referenceGeneration !== undefined) {
      const count = family.referenceGenerationCount + (newGeneration - family.referenceGeneration);
      if (count > 0) updates.generationCount = count;
    }

    // 족보 정보 자동채움 (배우자 관계가 아닐 때만)
    if (relationType !== "SPOUSE" && family?.surname && !formData.surname) {
      updates.surname = family.surname;
      if (family.clan) updates.clan = family.clan;
      if (family.branch) updates.branch = family.branch;
    }

    setFormData((prev) => ({ ...prev, ...updates }));

    // 관계 자동설정: 세대가 0이 아니면 부모-자녀 관계로 자동 설정
    if (!isEdit && existingMembers.length > 0 && newGeneration > 0) {
      const parentGen = newGeneration - 1;
      const parentCandidates = existingMembers.filter((m) => m.generation === parentGen);
      if (parentCandidates.length > 0) {
        setRelationType("PARENT_CHILD");
        // 부모 후보가 1명이면 자동 선택
        if (parentCandidates.length === 1) {
          setRelationMemberId(parentCandidates[0].id);
        } else if (!relationMemberId || !parentCandidates.find((m) => m.id === relationMemberId)) {
          setRelationMemberId("");
        }
      }
    }
  };

  // 관계 타입 변경 시 족보 정보 처리
  const handleRelationTypeChange = (type: "" | "SPOUSE" | "PARENT_CHILD") => {
    setRelationType(type);
    setRelationMemberId("");
    if (type === "SPOUSE") {
      // 배우자는 다른 성씨일 수 있으므로 족보 정보 초기화
      setFormData((prev) => ({ ...prev, surname: "", clan: "", branch: "", generationCount: 0 }));
    } else if (type === "PARENT_CHILD" || type === "") {
      // 자녀/직계는 같은 성씨 → 자동채움
      if (family?.surname) {
        setFormData((prev) => ({
          ...prev,
          surname: family.surname || "",
          clan: family.clan || "",
          branch: family.branch || "",
        }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("사진 크기는 5MB 이하여야 합니다.");
      return;
    }
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKorean.trim()) return;

    setSubmitting(true);
    try {
      let profileImageUrl = initialData?.profileImage;

      if (profileImage && userProfile?.familyId) {
        const storage = getFirebaseStorage();
        const imageRef = ref(storage, `families/${userProfile.familyId}/members/${Date.now()}_${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      const relation = relationType && relationMemberId
        ? { memberId: relationMemberId, type: relationType as "SPOUSE" | "PARENT_CHILD" }
        : undefined;

      await onSubmit({
        nameKorean: formData.nameKorean,
        nameHanja: formData.nameHanja || undefined,
        gender: formData.gender,
        birthDate: formData.birthDate ? new Date(formData.birthDate) as unknown as FamilyMember["birthDate"] : undefined,
        birthDateLunar: formData.birthDateLunar || undefined,
        deathDate: formData.deathDate ? new Date(formData.deathDate) as unknown as FamilyMember["deathDate"] : undefined,
        isAlive: formData.isAlive,
        generation: formData.generation,
        birthOrder: formData.birthOrder,
        surname: formData.surname || undefined,
        clan: formData.clan || undefined,
        branch: formData.branch || undefined,
        generationName: formData.generationName || undefined,
        generationCount: formData.generationCount || undefined,
        bio: formData.bio || undefined,
        occupation: formData.occupation || undefined,
        birthPlace: formData.birthPlace || undefined,
        currentPlace: formData.currentPlace || undefined,
        profileImage: profileImageUrl,
      }, relation);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-semibold text-lg">
            {isEdit ? "구성원 수정" : "구성원 추가"}
          </h2>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-primary/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <Avatar name={formData.nameKorean || "?"} gender={formData.gender} size="lg" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:underline"
            >
              사진 {previewUrl ? "변경" : "추가"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="nameKorean"
              label="이름 (한글) *"
              value={formData.nameKorean}
              onChange={(e) => setFormData({ ...formData, nameKorean: e.target.value })}
              placeholder="홍길동"
              required
            />
            <Input
              id="nameHanja"
              label="이름 (한자)"
              value={formData.nameHanja}
              onChange={(e) => setFormData({ ...formData, nameHanja: e.target.value })}
              placeholder="洪吉童"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">성별 *</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={() => setFormData({ ...formData, gender: "MALE" })}
                  className="accent-accent-blue"
                />
                <span className="text-sm">남성</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={() => setFormData({ ...formData, gender: "FEMALE" })}
                  className="accent-accent-red"
                />
                <span className="text-sm">여성</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="birthDate"
              label="생년월일 (양력)"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
            <Input
              id="birthDateLunar"
              label="생년월일 (음력)"
              value={formData.birthDateLunar}
              onChange={(e) => setFormData({ ...formData, birthDateLunar: e.target.value })}
              placeholder="1960-03-15"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAlive}
                onChange={(e) => setFormData({ ...formData, isAlive: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-sm">생존</span>
            </label>
            {!formData.isAlive && (
              <Input
                id="deathDate"
                label="사망일"
                type="date"
                value={formData.deathDate}
                onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                className="flex-1"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">세대</label>
              <select
                value={formData.generation}
                onChange={(e) => handleGenerationChange(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[0, 1, 2, 3, 4, 5].map((g) => (
                  <option key={g} value={g}>{g + 1}세대</option>
                ))}
              </select>
            </div>
            <Input
              id="birthOrder"
              label="출생 순서"
              type="number"
              min={1}
              value={formData.birthOrder}
              onChange={(e) => setFormData({ ...formData, birthOrder: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="surname"
              label="성씨"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              placeholder="김"
            />
            <Input
              id="clan"
              label="본관"
              value={formData.clan}
              onChange={(e) => setFormData({ ...formData, clan: e.target.value })}
              placeholder="김해"
            />
            <Input
              id="branch"
              label="파"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              placeholder="충의공파"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="generationName"
              label="항렬자"
              value={formData.generationName}
              onChange={(e) => setFormData({ ...formData, generationName: e.target.value })}
              placeholder="영(永)"
            />
            <Input
              id="generationCount"
              label="몇 대손"
              type="number"
              min={0}
              value={formData.generationCount}
              onChange={(e) => setFormData({ ...formData, generationCount: Number(e.target.value) })}
              placeholder="25"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="occupation"
              label="직업"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
            <Input
              id="birthPlace"
              label="출생지"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            />
          </div>

          <Input
            id="currentPlace"
            label="현 거주지"
            value={formData.currentPlace}
            onChange={(e) => setFormData({ ...formData, currentPlace: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">소개</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="간단한 소개를 적어주세요"
            />
          </div>

          {/* Relationship */}
          {!isEdit && existingMembers.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <label className="text-sm font-medium text-gray-900 block">관계 설정 (선택)</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="relType"
                    checked={relationType === ""}
                    onChange={() => handleRelationTypeChange("")}
                    className="accent-primary"
                  />
                  없음
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="relType"
                    checked={relationType === "SPOUSE"}
                    onChange={() => handleRelationTypeChange("SPOUSE")}
                    className="accent-accent-red"
                  />
                  배우자
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="relType"
                    checked={relationType === "PARENT_CHILD"}
                    onChange={() => handleRelationTypeChange("PARENT_CHILD")}
                    className="accent-accent-blue"
                  />
                  자녀
                </label>
              </div>
              {relationType && (() => {
                // 부모-자녀: 윗세대만, 배우자: 같은 세대만 표시
                const filtered = relationType === "PARENT_CHILD"
                  ? existingMembers.filter((m) => m.generation === formData.generation - 1)
                  : relationType === "SPOUSE"
                  ? existingMembers.filter((m) => m.generation === formData.generation)
                  : existingMembers;

                return (
                  <select
                    value={relationMemberId}
                    onChange={(e) => setRelationMemberId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">
                      {relationType === "SPOUSE" ? "누구의 배우자인가요?" : "누구의 자녀인가요?"}
                    </option>
                    {filtered.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameKorean} ({m.generation + 1}세대)
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              취소
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "저장 중..." : isEdit ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
