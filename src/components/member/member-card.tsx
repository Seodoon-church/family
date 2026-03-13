"use client";


import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";
import { Pencil } from "lucide-react";

interface MemberCardProps {
  member: FamilyMember;
  onEdit?: (member: FamilyMember) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border warm-shadow portrait-hover p-4 text-center",
        !member.isAlive && "member-deceased"
      )}
    >
      <a href={`/members/${member.id}`} className="flex flex-col items-center gap-2">
        <Avatar
          name={member.nameKorean}
          src={member.profileImage}
          gender={member.gender}
          size="lg"
          className="ring-2 ring-border"
        />
        <div className="min-w-0 w-full">
          <h3
            className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {member.nameKorean}
            {member.nameHanja && (
              <span className="text-xs text-muted ml-1">({member.nameHanja})</span>
            )}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {member.generation + 1}세대
            {member.generationCount ? ` · ${member.generationCount}대손` : ""}
          </p>
          {member.occupation && (
            <p className="text-xs text-muted">{member.occupation}</p>
          )}
          {(member.surname || member.clan || member.branch) && (
            <p className="text-[10px] text-muted">
              {[member.clan, member.surname && `${member.surname}씨`, member.branch].filter(Boolean).join(" ")}
            </p>
          )}
          {member.currentPlace && (
            <p className="text-xs text-muted">{member.currentPlace}</p>
          )}
          {!member.isAlive && (
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-warm-hover text-muted">
              작고
            </span>
          )}
        </div>
      </a>
      {onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(member); }}
          className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors mx-auto"
        >
          <Pencil className="w-3 h-3" />
          수정
        </button>
      )}
    </div>
  );
}
