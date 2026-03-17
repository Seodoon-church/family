"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { useRelationships } from "@/hooks/use-relationships";
import { useFamily } from "@/hooks/use-family";
import { MemberProfile } from "@/components/member/member-profile";
import { MemberForm } from "@/components/member/member-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import type { FamilyMember, Relationship } from "@/types/family";

export function MemberDetailClient() {
  const params = useParams();
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { members, updateMember, deleteMember } = useMembers(familyId);
  const { relationships } = useRelationships(familyId);
  const { family } = useFamily(familyId);

  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = userProfile?.role === "OWNER" || userProfile?.role === "ADMIN";

  // Static export에서 useParams가 '_'를 반환할 수 있으므로 URL에서 직접 추출
  const id = (() => {
    const paramId = params.id as string;
    if (paramId && paramId !== "_") return paramId;
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/members\/([^/]+)/);
      if (match) return match[1];
    }
    return paramId;
  })();

  useEffect(() => {
    if (!id || id === "_" || !familyId) return;

    const fetchMember = async () => {
      const db = getFirebaseDb();
      const memberDoc = await getDoc(
        doc(db, "families", familyId, "members", id)
      );
      if (memberDoc.exists()) {
        setMember({ id: memberDoc.id, ...memberDoc.data() } as FamilyMember);
      }
      setLoading(false);
    };

    fetchMember();
  }, [id, familyId]);

  // members 리스트에서 실시간 업데이트 반영
  useEffect(() => {
    if (!id || !members.length) return;
    const updated = members.find((m) => m.id === id);
    if (updated) setMember(updated);
  }, [members, id]);

  // 이 구성원의 관계 추출
  const memberRelations = (() => {
    if (!member || !relationships.length || !members.length) return null;

    const parents: FamilyMember[] = [];
    const children: FamilyMember[] = [];
    const spouses: FamilyMember[] = [];

    for (const rel of relationships) {
      if (rel.type === "PARENT_CHILD") {
        // fromId = parent, toId = child
        if (rel.toId === member.id) {
          const parent = members.find((m) => m.id === rel.fromId);
          if (parent) parents.push(parent);
        }
        if (rel.fromId === member.id) {
          const child = members.find((m) => m.id === rel.toId);
          if (child) children.push(child);
        }
      } else if (rel.type === "SPOUSE") {
        if (rel.fromId === member.id) {
          const spouse = members.find((m) => m.id === rel.toId);
          if (spouse) spouses.push(spouse);
        }
        if (rel.toId === member.id) {
          const spouse = members.find((m) => m.id === rel.fromId);
          if (spouse) spouses.push(spouse);
        }
      }
    }

    if (!parents.length && !children.length && !spouses.length) return null;
    return { parents, children, spouses };
  })();

  const handleEdit = async (data: Partial<FamilyMember>) => {
    if (!member) return;
    await updateMember(member.id, data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!member) return;
    setDeleting(true);
    try {
      await deleteMember(member.id);
      window.location.href = "/members";
    } catch (err) {
      console.error("Failed to delete member:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="구성원 정보를 불러오는 중..." />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted">구성원을 찾을 수 없습니다.</p>
        <a href="/members">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <a href="/members" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          구성원 목록
        </a>

        {isAdmin && !isEditing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1" />
              수정
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-accent-red hover:text-accent-red hover:border-accent-red"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* Profile or Edit Form */}
      {isEditing ? (
        <MemberForm
          initialData={member}
          family={family}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          isEdit
        />
      ) : (
        <MemberProfile member={member} relations={memberRelations} />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`${member.nameKorean}님을 삭제하시겠습니까?`}
        description="삭제된 구성원은 복구할 수 없습니다. 관련된 관계 정보는 자동으로 삭제되지 않으니 별도로 정리해주세요."
        confirmText="삭제"
        danger
        loading={deleting}
      />
    </div>
  );
}
