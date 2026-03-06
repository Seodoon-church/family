"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FamilyMember, Relationship } from "@/types/family";
import { Link2, X, Plus } from "lucide-react";

interface RelationshipManagerProps {
  members: FamilyMember[];
  relationships: Relationship[];
  onAdd: (fromId: string, toId: string, type: "PARENT_CHILD" | "SPOUSE") => Promise<void>;
  onDelete: (relId: string) => Promise<void>;
}

export function RelationshipManager({
  members,
  relationships,
  onAdd,
  onDelete,
}: RelationshipManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [type, setType] = useState<"PARENT_CHILD" | "SPOUSE">("PARENT_CHILD");
  const [submitting, setSubmitting] = useState(false);

  const getMemberName = (id: string) =>
    members.find((m) => m.id === id)?.nameKorean || "알 수 없음";

  const getRelLabel = (rel: Relationship) => {
    if (rel.type === "PARENT_CHILD") {
      return `${getMemberName(rel.fromId)} → ${getMemberName(rel.toId)} (부모-자녀)`;
    }
    return `${getMemberName(rel.fromId)} ↔ ${getMemberName(rel.toId)} (배우자)`;
  };

  const handleAdd = async () => {
    if (!fromId || !toId || fromId === toId) return;
    setSubmitting(true);
    try {
      await onAdd(fromId, toId, type);
      setShowForm(false);
      setFromId("");
      setToId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          관계 관리
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3 h-3 mr-1" />
          관계 추가
        </Button>
      </div>

      {showForm && (
        <div className="bg-primary-light/50 rounded-lg p-4 space-y-3 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">기준 (부모/배우자)</label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white px-2 text-sm"
              >
                <option value="">선택...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameKorean} ({m.generation + 1}세대)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">대상 (자녀/배우자)</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white px-2 text-sm"
              >
                <option value="">선택...</option>
                {members.filter((m) => m.id !== fromId).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameKorean} ({m.generation + 1}세대)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">관계 유형</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={type === "PARENT_CHILD"}
                  onChange={() => setType("PARENT_CHILD")}
                  className="accent-primary"
                />
                부모-자녀
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={type === "SPOUSE"}
                  onChange={() => setType("SPOUSE")}
                  className="accent-accent-red"
                />
                배우자
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={submitting || !fromId || !toId}>
              {submitting ? "추가 중..." : "추가"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {relationships.length === 0 ? (
          <p className="text-sm text-muted py-2">등록된 관계가 없습니다.</p>
        ) : (
          relationships.map((rel) => (
            <div
              key={rel.id}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-primary-light/30 text-sm"
            >
              <span>{getRelLabel(rel)}</span>
              <button
                onClick={() => onDelete(rel.id)}
                className="p-1 hover:bg-primary-light rounded"
                title="관계 삭제"
              >
                <X className="w-3 h-3 text-muted" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
