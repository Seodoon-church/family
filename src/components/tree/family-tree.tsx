"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { useRelationships } from "@/hooks/use-relationships";
import { useTreeData } from "@/hooks/use-tree-data";
import { ModernTree } from "./modern-tree";
import { TraditionalTree } from "./traditional-tree";
import { TreeControls } from "./tree-controls";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { GitBranchPlus, ScrollText } from "lucide-react";
import type { TreeViewMode } from "@/types/tree";

export function FamilyTree() {
  const [viewMode, setViewMode] = useState<TreeViewMode>("modern");
  const [zoom, setZoom] = useState(1);
  const { userProfile } = useAuth();
  const { members, loading: membersLoading } = useMembers(userProfile?.familyId);
  const { relationships, loading: relsLoading } = useRelationships(userProfile?.familyId);
  const treeData = useTreeData(members, relationships);

  const loading = membersLoading || relsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner text="가계도를 불러오는 중..." />
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <p className="font-heading text-lg">가족 구성원을 먼저 등록해주세요</p>
          <p className="text-sm text-muted">
            구성원과 관계를 등록하면 가계도가 자동으로 생성됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "modern" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("modern")}
          >
            <GitBranchPlus className="w-4 h-4 mr-1" />
            현대식
          </Button>
          <Button
            variant={viewMode === "traditional" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("traditional")}
          >
            <ScrollText className="w-4 h-4 mr-1" />
            전통 족보
          </Button>
        </div>
        <TreeControls zoom={zoom} onZoomChange={setZoom} />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto relative" style={{ minHeight: "500px" }}>
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease",
          }}
        >
          {viewMode === "modern" ? (
            <ModernTree data={treeData} />
          ) : (
            <TraditionalTree data={treeData} />
          )}
        </div>
      </div>
    </div>
  );
}
