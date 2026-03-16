"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

interface UsePanZoomOptions {
  minScale?: number;
  maxScale?: number;
  contentWidth: number;
  contentHeight: number;
}

export function usePanZoom({
  minScale = 0.3,
  maxScale = 3.0,
  contentWidth,
  contentHeight,
}: UsePanZoomOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PanZoomState>({ x: 0, y: 0, scale: 1 });

  // Drag state refs (not in React state for performance)
  const dragStart = useRef<{ x: number; y: number; viewX: number; viewY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistRef = useRef(0);

  // Touch state refs
  const lastPinchDist = useRef(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);

  // Animation ref
  const rafId = useRef<number>(0);

  const clampScale = useCallback((s: number) => Math.max(minScale, Math.min(maxScale, s)), [minScale, maxScale]);

  // Compute viewBox from state
  const viewBox = (() => {
    if (contentWidth <= 0 || contentHeight <= 0) return "0 0 100 100";
    const vbW = contentWidth / state.scale;
    const vbH = contentHeight / state.scale;
    return `${state.x} ${state.y} ${vbW} ${vbH}`;
  })();

  // Animate to target state
  const animateTo = useCallback((targetX: number, targetY: number, targetScale: number, duration = 300) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const startTime = performance.now();
    const startX = state.x;
    const startY = state.y;
    const startScale = state.scale;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

      setState({
        x: startX + (targetX - startX) * eased,
        y: startY + (targetY - startY) * eased,
        scale: startScale + (targetScale - startScale) * eased,
      });

      if (t < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
  }, [state]);

  // Set scale (from buttons) with animation
  const setScale = useCallback((newScale: number) => {
    const clamped = clampScale(newScale);
    const container = containerRef.current;
    if (!container || contentWidth <= 0) {
      setState((prev) => ({ ...prev, scale: clamped }));
      return;
    }

    // Zoom toward center of current view
    const vbW = contentWidth / state.scale;
    const vbH = contentHeight / state.scale;
    const centerX = state.x + vbW / 2;
    const centerY = state.y + vbH / 2;

    const newVbW = contentWidth / clamped;
    const newVbH = contentHeight / clamped;

    animateTo(centerX - newVbW / 2, centerY - newVbH / 2, clamped);
  }, [clampScale, contentWidth, contentHeight, state, animateTo]);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const padding = 40;
    animateTo(-padding, -padding, 1, 300);
  }, [animateTo]);

  // Center on a specific SVG coordinate
  const centerOnPoint = useCallback((px: number, py: number) => {
    if (contentWidth <= 0) return;
    const vbW = contentWidth / state.scale;
    const vbH = contentHeight / state.scale;
    animateTo(px - vbW / 2, py - vbH / 2, state.scale, 400);
  }, [contentWidth, contentHeight, state.scale, animateTo]);

  // Reset
  const resetView = useCallback(() => {
    animateTo(0, 0, 1, 300);
  }, [animateTo]);

  // Event handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTouchDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const getTouchCenter = (t1: Touch, t2: Touch) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    });

    // --- Mouse wheel zoom ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const cursorFracX = (e.clientX - rect.left) / rect.width;
      const cursorFracY = (e.clientY - rect.top) / rect.height;

      setState((prev) => {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(minScale, Math.min(maxScale, prev.scale * zoomFactor));

        const vbW = contentWidth / prev.scale;
        const vbH = contentHeight / prev.scale;
        const newVbW = contentWidth / newScale;
        const newVbH = contentHeight / newScale;

        return {
          x: prev.x + (vbW - newVbW) * cursorFracX,
          y: prev.y + (vbH - newVbH) * cursorFracY,
          scale: newScale,
        };
      });
    };

    // --- Mouse drag ---
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragStart.current = { x: e.clientX, y: e.clientY, viewX: 0, viewY: 0 };
      dragDistRef.current = 0;
      isDraggingRef.current = false;
      container.style.cursor = "grabbing";

      // Capture current state
      setState((prev) => {
        dragStart.current = { x: e.clientX, y: e.clientY, viewX: prev.x, viewY: prev.y };
        return prev;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragDistRef.current = Math.max(dragDistRef.current, Math.abs(dx) + Math.abs(dy));

      if (dragDistRef.current > 5) {
        isDraggingRef.current = true;
      }

      const rect = container.getBoundingClientRect();
      setState((prev) => {
        const vbW = contentWidth / prev.scale;
        const vbH = contentHeight / prev.scale;
        return {
          ...prev,
          x: dragStart.current!.viewX - (dx / rect.width) * vbW,
          y: dragStart.current!.viewY - (dy / rect.height) * vbH,
        };
      });
    };

    const handleMouseUp = () => {
      dragStart.current = null;
      container.style.cursor = "grab";
      // Keep isDraggingRef true briefly to block the click event
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    // --- Touch ---
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching.current = true;
        lastPinchDist.current = getTouchDistance(e.touches[0], e.touches[1]);
        lastTouchCenter.current = getTouchCenter(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1) {
        isPinching.current = false;
        const touch = e.touches[0];
        dragDistRef.current = 0;
        isDraggingRef.current = false;

        setState((prev) => {
          dragStart.current = { x: touch.clientX, y: touch.clientY, viewX: prev.x, viewY: prev.y };
          return prev;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDistance(e.touches[0], e.touches[1]);
        const center = getTouchCenter(e.touches[0], e.touches[1]);

        if (lastPinchDist.current > 0) {
          const zoomFactor = dist / lastPinchDist.current;
          const rect = container.getBoundingClientRect();
          const cursorFracX = (center.x - rect.left) / rect.width;
          const cursorFracY = (center.y - rect.top) / rect.height;

          setState((prev) => {
            const newScale = Math.max(minScale, Math.min(maxScale, prev.scale * zoomFactor));
            const vbW = contentWidth / prev.scale;
            const vbH = contentHeight / prev.scale;
            const newVbW = contentWidth / newScale;
            const newVbH = contentHeight / newScale;

            // Pan based on center movement
            let panX = 0;
            let panY = 0;
            if (lastTouchCenter.current) {
              const dx = center.x - lastTouchCenter.current.x;
              const dy = center.y - lastTouchCenter.current.y;
              panX = (dx / rect.width) * vbW;
              panY = (dy / rect.height) * vbH;
            }

            return {
              x: prev.x + (vbW - newVbW) * cursorFracX - panX,
              y: prev.y + (vbH - newVbH) * cursorFracY - panY,
              scale: newScale,
            };
          });
        }

        lastPinchDist.current = dist;
        lastTouchCenter.current = center;
        isDraggingRef.current = true;
      } else if (e.touches.length === 1 && !isPinching.current && dragStart.current) {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - dragStart.current.x;
        const dy = touch.clientY - dragStart.current.y;
        dragDistRef.current = Math.max(dragDistRef.current, Math.abs(dx) + Math.abs(dy));

        if (dragDistRef.current > 5) {
          isDraggingRef.current = true;
        }

        const rect = container.getBoundingClientRect();
        setState((prev) => {
          const vbW = contentWidth / prev.scale;
          const vbH = contentHeight / prev.scale;
          return {
            ...prev,
            x: dragStart.current!.viewX - (dx / rect.width) * vbW,
            y: dragStart.current!.viewY - (dy / rect.height) * vbH,
          };
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        lastPinchDist.current = 0;
        lastTouchCenter.current = null;
        isPinching.current = false;
        dragStart.current = null;
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      } else if (e.touches.length === 1) {
        // Switched from pinch to single finger
        isPinching.current = false;
        lastPinchDist.current = 0;
        const touch = e.touches[0];
        setState((prev) => {
          dragStart.current = { x: touch.clientX, y: touch.clientY, viewX: prev.x, viewY: prev.y };
          return prev;
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [contentWidth, contentHeight, minScale, maxScale]);

  return {
    containerRef,
    viewBox,
    scale: state.scale,
    setScale,
    fitToScreen,
    resetView,
    centerOnPoint,
    isDraggingRef,
  };
}
