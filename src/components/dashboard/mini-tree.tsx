"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { FamilyMember } from "@/types/family";
import { GitBranchPlus } from "lucide-react";

interface MiniTreeProps {
  members: FamilyMember[];
}

export function MiniTree({ members }: MiniTreeProps) {
  return (
    <Link href="/tree">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranchPlus className="w-5 h-5 text-primary" />
            가계도
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="h-24 flex items-center justify-center bg-primary-light/30 rounded-lg border border-border">
              <p className="text-sm text-muted">가계도를 확인하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Group by generation and show first few */}
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
                    <p className="text-[10px] text-muted mb-1">{Number(gen) + 1}세대</p>
                    <div className="flex gap-1 flex-wrap">
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
                        <span className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-[10px] text-muted">
                          +{genMembers.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              <p className="text-xs text-primary">전체 가계도 보기 &rarr;</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
