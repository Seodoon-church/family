"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MemberProfile } from "@/components/member/member-profile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import type { FamilyMember } from "@/types/family";

export function MemberDetailClient() {
  const params = useParams();
  const id = params.id as string;
  const { userProfile } = useAuth();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.familyId) return;

    const fetchMember = async () => {
      const db = getFirebaseDb();
      const memberDoc = await getDoc(
        doc(db, "families", userProfile.familyId!, "members", id)
      );
      if (memberDoc.exists()) {
        setMember({ id: memberDoc.id, ...memberDoc.data() } as FamilyMember);
      }
      setLoading(false);
    };

    fetchMember();
  }, [id, userProfile?.familyId]);

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
      <a href="/members" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        구성원 목록
      </a>
      <MemberProfile member={member} />
    </div>
  );
}
