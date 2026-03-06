"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FamilyMember } from "@/types/family";
import { X } from "lucide-react";

interface MemberFormProps {
  initialData?: Partial<FamilyMember>;
  onSubmit: (data: Partial<FamilyMember>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function MemberForm({ initialData, onSubmit, onCancel, isEdit }: MemberFormProps) {
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
    clan: initialData?.clan || "",
    bio: initialData?.bio || "",
    occupation: initialData?.occupation || "",
    birthPlace: initialData?.birthPlace || "",
    currentPlace: initialData?.currentPlace || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKorean.trim()) return;

    setSubmitting(true);
    try {
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
        clan: formData.clan || undefined,
        bio: formData.bio || undefined,
        occupation: formData.occupation || undefined,
        birthPlace: formData.birthPlace || undefined,
        currentPlace: formData.currentPlace || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg">
            {isEdit ? "구성원 수정" : "구성원 추가"}
          </h2>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-primary-light">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
            <label className="text-sm font-medium text-foreground mb-1 block">성별 *</label>
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
              <label className="text-sm font-medium text-foreground mb-1 block">세대</label>
              <select
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: Number(e.target.value) })}
                className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

          <Input
            id="clan"
            label="본관"
            value={formData.clan}
            onChange={(e) => setFormData({ ...formData, clan: e.target.value })}
            placeholder="김해 김씨"
          />

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
            <label className="text-sm font-medium text-foreground mb-1 block">소개</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="간단한 소개를 적어주세요"
            />
          </div>

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
