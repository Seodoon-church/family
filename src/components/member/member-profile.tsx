"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";
import { MapPin, Briefcase, Calendar, BookOpen } from "lucide-react";

interface MemberProfileProps {
  member: FamilyMember;
}

export function MemberProfile({ member }: MemberProfileProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Avatar
          name={member.nameKorean}
          src={member.profileImage}
          gender={member.gender}
          size="xl"
        />
        <div className="text-center sm:text-left">
          <h1 className="font-heading text-2xl font-bold">
            {member.nameKorean}
            {member.nameHanja && (
              <span className="text-lg text-muted ml-2">({member.nameHanja})</span>
            )}
          </h1>
          <p className="text-sm text-muted mt-1">
            {member.generation + 1}세대 · {member.gender === "MALE" ? "남" : "여"}
            {!member.isAlive && " · 작고"}
          </p>
          {member.clan && (
            <p className="text-sm text-primary mt-1">{member.clan}</p>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {member.birthDate && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-accent-blue shrink-0" />
              <div>
                <p className="text-xs text-muted">생년월일</p>
                <p className="text-sm font-medium">
                  {formatDate(member.birthDate.toDate())}
                </p>
                {member.birthDateLunar && (
                  <p className="text-xs text-muted">음력 {member.birthDateLunar}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {member.occupation && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-accent-gold shrink-0" />
              <div>
                <p className="text-xs text-muted">직업</p>
                <p className="text-sm font-medium">{member.occupation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {member.currentPlace && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-accent-red shrink-0" />
              <div>
                <p className="text-xs text-muted">거주지</p>
                <p className="text-sm font-medium">{member.currentPlace}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {member.birthPlace && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-accent-green shrink-0" />
              <div>
                <p className="text-xs text-muted">출생지</p>
                <p className="text-sm font-medium">{member.birthPlace}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bio */}
      {member.bio && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-bold">소개</h3>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{member.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
