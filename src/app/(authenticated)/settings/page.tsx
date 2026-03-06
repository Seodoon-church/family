"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberForm } from "@/components/member/member-form";
import { Avatar } from "@/components/ui/avatar";
import { Settings, Users, User, UserPlus, Shield } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { FamilyMember } from "@/types/family";

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const { members, addMember } = useMembers(userProfile?.familyId);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const isAdmin = userProfile?.role === "ADMIN";

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      setPasswordMsg("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setChangingPassword(true);
    setPasswordMsg("");

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMsg("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMsg("현재 비밀번호가 올바르지 않습니다.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddMember = async (data: Partial<FamilyMember>) => {
    await addMember(data as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">);
    setShowMemberForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl">설정</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              내 계정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={userProfile?.displayName || ""}
                src={userProfile?.profileImage}
                size="lg"
              />
              <div>
                <p className="font-medium">{userProfile?.displayName}</p>
                <p className="text-sm text-muted">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-accent-gold" />
              <span>{isAdmin ? "관리자" : "구성원"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent-gold" />
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              id="current-password"
              type="password"
              label="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
            />
            <Input
              id="new-password"
              type="password"
              label="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (6자 이상)"
            />
            {passwordMsg && (
              <p className={`text-xs ${passwordMsg.includes("변경") ? "text-accent-green" : "text-accent-red"}`}>
                {passwordMsg}
              </p>
            )}
            <Button
              size="sm"
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword}
            >
              {changingPassword ? "변경 중..." : "변경"}
            </Button>
          </CardContent>
        </Card>

        {/* Family Management (Admin only) */}
        {isAdmin && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-blue" />
                가족 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">
                  등록된 구성원: <span className="font-bold text-foreground">{members.length}명</span>
                </p>
                <Button size="sm" onClick={() => setShowMemberForm(true)}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  구성원 추가
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-primary-light/30">
                    <Avatar name={m.nameKorean} gender={m.gender} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.nameKorean}</p>
                      <p className="text-[10px] text-muted">{m.generation + 1}세대</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showMemberForm && (
        <MemberForm
          onSubmit={handleAddMember}
          onCancel={() => setShowMemberForm(false)}
        />
      )}
    </div>
  );
}
