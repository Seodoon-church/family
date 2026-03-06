"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface TreeControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function TreeControls({ zoom, onZoomChange }: TreeControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
        title="축소"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
        title="확대"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(1)}
        title="원래 크기"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
