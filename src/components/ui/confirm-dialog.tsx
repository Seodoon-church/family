"use client";

import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card rounded-2xl shadow-lg max-w-sm w-full p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-muted hover:text-foreground hover:bg-warm-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {danger && (
            <div className="shrink-0 w-10 h-10 rounded-full bg-accent-red/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-accent-red" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted mt-1">{description}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? "bg-accent-red hover:bg-accent-red/90 text-white" : ""}
          >
            {loading ? "처리 중..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
