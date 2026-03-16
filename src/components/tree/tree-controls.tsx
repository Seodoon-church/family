"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface TreeControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen?: () => void;
}

export function TreeControls({ zoom, onZoomChange, onFitToScreen }: TreeControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(Math.max(0.3, zoom / 1.2))}
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
        onClick={() => onZoomChange(Math.min(3, zoom * 1.2))}
        title="확대"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onFitToScreen || (() => onZoomChange(1))}
        title="화면에 맞추기"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
