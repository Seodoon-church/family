"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";

interface MemberCardProps {
  member: FamilyMember;
  onEdit?: (member: FamilyMember) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer",
        !member.isAlive && "opacity-75"
      )}
    >
      <Link href={`/members/${member.id}`} className="flex items-center gap-3">
        <Avatar
          name={member.nameKorean}
          src={member.profileImage}
          gender={member.gender}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-foreground truncate">
              {member.nameKorean}
            </h3>
            {member.nameHanja && (
              <span className="text-xs text-muted">({member.nameHanja})</span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {member.generation + 1}세대
            {member.occupation && ` · ${member.occupation}`}
          </p>
          {member.currentPlace && (
            <p className="text-xs text-muted">{member.currentPlace}</p>
          )}
          {!member.isAlive && (
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-primary-light text-muted">
              작고
            </span>
          )}
        </div>
      </Link>
      {onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(member); }}
          className="mt-2 text-xs text-primary hover:underline"
        >
          수정
        </button>
      )}
    </div>
  );
}
