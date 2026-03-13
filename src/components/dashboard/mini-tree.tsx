"use client";


import { Avatar } from "@/components/ui/avatar";
import type { FamilyMember } from "@/types/family";
import { TreePine, ArrowRight } from "lucide-react";

interface MiniTreeProps {
  members: FamilyMember[];
}

export function MiniTree({ members }: MiniTreeProps) {
  return (
    <div className="bg-card rounded-xl border border-border warm-shadow p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TreePine className="w-4 h-4 text-accent-green" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-story)" }}>
            우리 가계도
          </h3>
        </div>
        <a
          href="/tree"
          className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          전체 보기 <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Content */}
      {members.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-background rounded-xl py-6">
          <p className="text-sm text-muted">가계도를 확인하세요</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {Object.entries(
            members.reduce((acc, m) => {
              const gen = m.generation;
              if (!acc[gen]) acc[gen] = [];
              acc[gen].push(m);
              return acc;
            }, {} as Record<number, FamilyMember[]>)
          )
            .sort(([a], [b]) => Number(a) - Number(b))
            .slice(0, 3)
            .map(([gen, genMembers]) => (
              <div key={gen}>
                <p className="chapter-number text-[11px] mb-1.5">
                  {Number(gen) + 1}세대
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {genMembers.slice(0, 6).map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.nameKorean}
                      src={m.profileImage}
                      gender={m.gender}
                      size="sm"
                    />
                  ))}
                  {genMembers.length > 6 && (
                    <span className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-[10px] text-muted">
                      +{genMembers.length - 6}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
