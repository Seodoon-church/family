"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FamilyMember, Family } from "@/types/family";
import { Pencil } from "lucide-react";

interface MemberCardProps {
  member: FamilyMember;
  family?: Family | null;
  onEdit?: (member: FamilyMember) => void;
}

export function MemberCard({ member, family, onEdit }: MemberCardProps) {
  const birthDateStr = member.birthDate
    ? new Date(member.birthDate.seconds * 1000).getFullYear() + "년생"
    : null;

  return (
    <div className={cn(!member.isAlive && "member-deceased")}>
      <div className="character-entry">
        {/* Left: Avatar */}
        <a href={`/members/${member.id}`} className="flex-shrink-0">
          <Avatar
            name={member.nameKorean}
            src={member.profileImage}
            gender={member.gender}
            size="xl"
            className="character-portrait ring-2 ring-border"
          />
        </a>

        {/* Right: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a href={`/members/${member.id}`} className="min-w-0">
              <h3
                className="font-semibold text-base text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-story)" }}
              >
                {member.nameKorean}
                {member.nameHanja && (
                  <span className="text-sm text-muted ml-1.5">({member.nameHanja})</span>
                )}
              </h3>
            </a>

            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); onEdit(member); }}
                className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors flex-shrink-0 mt-1"
              >
                <Pencil className="w-3 h-3" />
                수정
              </button>
            )}
          </div>

          {/* Relationship / role info */}
          {(() => {
            // 가문 성씨와 비교하여 직계 여부 판별 (사위/며느리는 대손 비표시)
            const familySurname = family?.surname;
            const isBloodRelative = !familySurname
              || (member.surname ? member.surname === familySurname : member.nameKorean.startsWith(familySurname));

            const genCount = isBloodRelative
              ? (member.generationCount
                || (family?.referenceGenerationCount && family.referenceGeneration != null
                  ? family.referenceGenerationCount + (member.generation - family.referenceGeneration)
                  : null))
              : null;

            // 본관/성씨/파 — 직계만 가족 공통값 폴백
            const surname = member.surname || (isBloodRelative ? family?.surname : undefined);
            const clan = member.clan || (isBloodRelative ? family?.clan : undefined);
            const branch = member.branch || (isBloodRelative ? family?.branch : undefined);
            const clanText = [clan, surname && `${surname}씨`, branch].filter(Boolean).join(" ");

            return (
              <>
                <p className="text-sm text-muted mt-0.5">
                  {member.generation + 1}세대
                  {genCount && genCount > 0 ? ` · ${genCount}대손` : ""}
                  {member.occupation ? ` · ${member.occupation}` : ""}
                </p>
                {clanText && (
                  <p className="text-xs text-muted mt-0.5">{clanText}</p>
                )}
              </>
            );
          })()}

          {/* Birth date */}
          {birthDateStr && (
            <p className="date-stamp text-xs mt-1">
              {birthDateStr}
            </p>
          )}

          {/* Current place */}
          {member.currentPlace && (
            <p className="text-xs text-muted mt-0.5">{member.currentPlace}</p>
          )}

          {/* Deceased badge */}
          {!member.isAlive && (
            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-warm-hover text-muted">
              작고
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
