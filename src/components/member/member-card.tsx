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
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer group",
        !member.isAlive && "opacity-70"
      )}
    >
      <a href={`/members/${member.id}`} className="flex items-center gap-3">
        <Avatar
          name={member.nameKorean}
          src={member.profileImage}
          gender={member.gender}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
              {member.nameKorean}
            </h3>
            {member.nameHanja && (
              <span className="text-xs text-gray-400">({member.nameHanja})</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {member.generation + 1}세대
            {member.generationCount ? ` · ${member.generationCount}대손` : ""}
            {member.occupation && ` · ${member.occupation}`}
          </p>
          {(member.surname || member.clan || member.branch) && (
            <p className="text-[10px] text-gray-400">
              {[member.clan, member.surname && `${member.surname}씨`, member.branch].filter(Boolean).join(" ")}
            </p>
          )}
          {member.currentPlace && (
            <p className="text-xs text-gray-400">{member.currentPlace}</p>
          )}
          {!member.isAlive && (
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              작고
            </span>
          )}
        </div>
      </a>
      {onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(member); }}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <Pencil className="w-3 h-3" />
          수정
        </button>
      )}
    </div>
  );
}
