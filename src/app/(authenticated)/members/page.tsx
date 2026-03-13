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
import { UserPlus, Users } from "lucide-react";
import type { FamilyMember } from "@/types/family";

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
        <LoadingSpinner text="구성원을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-story)" }}
          >
            가족 구성원
          </h1>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              구성원 추가
            </Button>
          )}
        </div>
        <div className="warm-divider mt-3" />
      </div>

      {members.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border warm-shadow min-h-[300px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-light mx-auto flex items-center justify-center">
              <Users className="w-8 h-8 text-primary/40" />
            </div>
            <p className="font-semibold text-foreground">
              아직 등록된 구성원이 없습니다
            </p>
            <p className="text-sm text-muted">
              가족 구성원을 추가하여 가계도를 만들어보세요.
            </p>
            {isAdmin && (
              <Button onClick={() => setShowForm(true)}>
                <UserPlus className="w-4 h-4 mr-1" />
                첫 번째 구성원 추가
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Members by generation */}
          {Object.keys(generations)
            .sort((a, b) => Number(a) - Number(b))
            .map((gen) => (
              <div key={gen}>
                <h2 className="mb-3 flex items-center gap-2">
                  <span className="chapter-number text-3xl">{Number(gen) + 1}</span>
                  <span className="text-sm font-semibold text-foreground">세대</span>
                  <div className="flex-1 h-px bg-border ml-2" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generations[Number(gen)]
                    .sort((a, b) => a.birthOrder - b.birthOrder)
                    .map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={isAdmin ? setEditingMember : undefined}
                      />
                    ))}
                </div>
              </div>
            ))}

          {/* Relationship Manager */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>관계 설정</CardTitle>
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
