"use client";


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { FamilyMember } from "@/types/family";
import { GitBranchPlus } from "lucide-react";

interface MiniTreeProps {
  members: FamilyMember[];
}

export function MiniTree({ members }: MiniTreeProps) {
  return (
    <a href="/tree">
      <Card className="cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitBranchPlus className="w-4 h-4 text-primary" />
            </div>
            가계도
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="h-24 flex items-center justify-center bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-400">가계도를 확인하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    <p className="text-[10px] text-gray-400 mb-1 font-medium">{Number(gen) + 1}세대</p>
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
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                          +{genMembers.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              <p className="text-xs text-primary font-medium">전체 가계도 보기 &rarr;</p>
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
