"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { useRelationships } from "@/hooks/use-relationships";
import { useFamily } from "@/hooks/use-family";
import { MemberCard } from "@/components/member/member-card";
import { MemberForm } from "@/components/member/member-form";
import { RelationshipManager } from "@/components/member/relationship-manager";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { UserPlus, Users } from "lucide-react";
import type { FamilyMember, Family } from "@/types/family";

import type { Relationship } from "@/types/family";

const generationDescriptions: Record<number, string> = {
  0: "이야기의 뿌리가 되는 분들",
  1: "가풍을 이어가시는 분들",
  2: "새로운 장을 쓰는 분들",
  3: "이야기를 이어갈 분들",
  4: "미래를 열어갈 분들",
  5: "가장 어린 세대",
};

type CoupleOrSingle =
  | { type: "couple"; husband: FamilyMember; wife: FamilyMember }
  | { type: "single"; member: FamilyMember };

function groupIntoCouples(
  members: FamilyMember[],
  relationships: Relationship[],
  family?: Family | null
): CoupleOrSingle[] {
  const spouseRels = relationships.filter((r) => r.type === "SPOUSE");
  const paired = new Set<string>();
  const result: CoupleOrSingle[] = [];

  // Sort members by birthOrder first
  const sorted = [...members].sort((a, b) => a.birthOrder - b.birthOrder);

  for (const member of sorted) {
    if (paired.has(member.id)) continue;

    // Find spouse relationship
    const spouseRel = spouseRels.find(
      (r) => r.fromId === member.id || r.toId === member.id
    );

    if (spouseRel) {
      const spouseId = spouseRel.fromId === member.id ? spouseRel.toId : spouseRel.fromId;
      const spouse = members.find((m) => m.id === spouseId);

      if (spouse && !paired.has(spouseId)) {
        paired.add(member.id);
        paired.add(spouseId);

        // Determine husband(left) and wife(right)
        let husband: FamilyMember;
        let wife: FamilyMember;

        if (member.gender !== spouse.gender) {
          // Different genders - MALE goes left
          husband = member.gender === "MALE" ? member : spouse;
          wife = member.gender === "MALE" ? spouse : member;
        } else {
          // Same gender (data issue) - family surname holder goes left
          const familySurname = family?.surname;
          if (familySurname) {
            const memberHasSurname = member.surname === familySurname
              || member.nameKorean.startsWith(familySurname);
            husband = memberHasSurname ? member : spouse;
            wife = memberHasSurname ? spouse : member;
          } else {
            husband = member;
            wife = spouse;
          }
        }

        result.push({ type: "couple", husband, wife });
        continue;
      }
    }

    result.push({ type: "single", member });
  }

  return result;
}

export default function MembersPage() {
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { members, loading, addMember, updateMember, deleteMember } = useMembers(familyId);
  const { relationships, addRelationship, deleteRelationship } = useRelationships(familyId);
  const { family } = useFamily(familyId);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const isAdmin = userProfile?.role === "ADMIN";

  const handleAdd = async (data: Partial<FamilyMember>, relation?: { memberId: string; type: "SPOUSE" | "PARENT_CHILD" }) => {
    const docRef = await addMember(data as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">);
    if (relation && docRef) {
      if (relation.type === "SPOUSE") {
        await addRelationship(relation.memberId, docRef, "SPOUSE");
      } else {
        await addRelationship(relation.memberId, docRef, "PARENT_CHILD");
      }
    }
    setShowForm(false);
  };

  const handleEdit = async (data: Partial<FamilyMember>) => {
    if (editingMember) {
      await updateMember(editingMember.id, data);
      setEditingMember(null);
    }
  };

  // Group members by generation
  const generations = members.reduce((acc, member) => {
    const gen = member.generation;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(member);
    return acc;
  }, {} as Record<number, FamilyMember[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="등장인물을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ChapterHeader
        title="등장인물"
        subtitle="이 이야기에 등장하는 사람들"
      />

      {isAdmin && (
        <div className="flex justify-center mb-6">
          <Button size="sm" onClick={() => setShowForm(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            등장인물 추가
          </Button>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary-light mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary/40" />
          </div>
          <p
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "var(--font-story)" }}
          >
            아직 등장인물이 없습니다
          </p>
          <p
            className="text-sm text-muted mb-6"
            style={{ fontFamily: "var(--font-story)" }}
          >
            가족 구성원을 추가하여 이야기를 시작해보세요.
          </p>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              첫 번째 등장인물 추가
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Members by generation */}
          {Object.keys(generations)
            .sort((a, b) => Number(a) - Number(b))
            .map((gen, idx) => (
              <div key={gen}>
                {idx > 0 && <OrnamentDivider symbol="~" className="my-2" />}

                {/* Generation header */}
                <div className="mb-4 mt-6">
                  <h2 className="flex items-center gap-3">
                    <span className="chapter-number text-3xl">{Number(gen) + 1}</span>
                    <span
                      className="text-lg font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-story)" }}
                    >
                      세대
                    </span>
                  </h2>
                  <p className="text-sm text-muted mt-1 ml-12">
                    {generationDescriptions[Number(gen)] || ""}
                  </p>
                </div>

                {/* Character entries - couples side by side */}
                <div className="ml-2">
                  {groupIntoCouples(generations[Number(gen)], relationships, family)
                    .map((entry, entryIdx) => (
                      <div key={entry.type === "couple" ? `${entry.husband.id}-${entry.wife.id}` : entry.member.id}>
                        {entryIdx > 0 && (
                          <OrnamentDivider symbol="·" className="my-0" />
                        )}
                        {entry.type === "couple" ? (
                          <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
                            <div className="flex-1">
                              <MemberCard
                                member={entry.husband}
                                family={family}
                                onEdit={isAdmin ? setEditingMember : undefined}
                              />
                            </div>
                            <div className="hidden sm:flex items-center text-accent-gold/40 text-lg select-none">♥</div>
                            <div className="flex-1">
                              <MemberCard
                                member={entry.wife}
                                family={family}
                                onEdit={isAdmin ? setEditingMember : undefined}
                              />
                            </div>
                          </div>
                        ) : (
                          <MemberCard
                            member={entry.member}
                            family={family}
                            onEdit={isAdmin ? setEditingMember : undefined}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}

          {/* Relationship Manager */}
          {isAdmin && (
            <>
              <OrnamentDivider className="my-8" />
              <Card>
                <CardHeader>
                  <CardTitle
                    style={{ fontFamily: "var(--font-story)" }}
                  >
                    관계 설정
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RelationshipManager
                    members={members}
                    relationships={relationships}
                    onAdd={addRelationship}
                    onDelete={deleteRelationship}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Add Member Form */}
      {showForm && (
        <MemberForm
          existingMembers={members}
          family={family}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Member Form */}
      {editingMember && (
        <MemberForm
          initialData={editingMember}
          onSubmit={handleEdit}
          onCancel={() => setEditingMember(null)}
          isEdit
        />
      )}
    </div>
  );
}
