"use client";

import { useMemo, useEffect } from "react";
import type { TreePerson } from "@/types/tree";

interface ModernTreeProps {
  data: TreePerson;
  viewBox?: string;
  isDragging?: boolean;
  onDimensionsChange?: (w: number, h: number) => void;
}

interface LayoutNode {
  person: TreePerson;
  x: number;
  y: number;
  spouse?: TreePerson;
  children: LayoutNode[];
}

const NODE_W = 140;
const NODE_H = 80;
const H_GAP = 40;
const V_GAP = 100;
const SPOUSE_GAP = 20;

function layoutTree(person: TreePerson, depth: number = 0): LayoutNode {
  const childNodes = person.children.map((child) => layoutTree(child, depth + 1));

  const selfWidth = NODE_W + (person.spouse ? NODE_W + SPOUSE_GAP : 0);

  let totalWidth: number;
  if (childNodes.length === 0) {
    totalWidth = selfWidth;
  } else {
    const childrenWidth = childNodes.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (childNodes.length - 1) * H_GAP;
    totalWidth = Math.max(childrenWidth, selfWidth);
  }

  // Position children - x = left edge of their visual block, centered in allocation
  if (childNodes.length > 0) {
    const childrenWidth = childNodes.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (childNodes.length - 1) * H_GAP;
    let xOffset = (totalWidth - childrenWidth) / 2;

    for (const child of childNodes) {
      const w = getSubtreeWidth(child);
      const childSelfW = NODE_W + (child.person.spouse ? NODE_W + SPOUSE_GAP : 0);
      const newX = xOffset + (w - childSelfW) / 2;
      const dx = newX - child.x;
      shiftTree(child, dx);
      xOffset += w + H_GAP;
    }
  }

  return {
    person,
    x: (totalWidth - selfWidth) / 2,
    y: depth * (NODE_H + V_GAP),
    spouse: person.spouse,
    children: childNodes,
  };
}

function getSubtreeWidth(node: LayoutNode): number {
  if (node.children.length === 0) {
    return NODE_W + (node.spouse ? NODE_W + SPOUSE_GAP : 0);
  }
  const childrenWidth = node.children.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (node.children.length - 1) * H_GAP;
  const selfWidth = NODE_W + (node.spouse ? NODE_W + SPOUSE_GAP : 0);
  return Math.max(childrenWidth, selfWidth);
}

function shiftTree(node: LayoutNode, dx: number) {
  node.x += dx;
  for (const child of node.children) {
    shiftTree(child, dx);
  }
}

function getAllNodes(node: LayoutNode): LayoutNode[] {
  return [node, ...node.children.flatMap(getAllNodes)];
}

export function ModernTree({ data, viewBox: externalViewBox, isDragging, onDimensionsChange }: ModernTreeProps) {
  const root = useMemo(() => {
    const tree = layoutTree(data);
    // Shift tree so no node is clipped on the left
    const all = getAllNodes(tree);
    const minX = Math.min(...all.map((n) => n.x));
    const PAD = 40;
    if (minX < PAD) {
      shiftTree(tree, PAD - minX);
    }
    return tree;
  }, [data]);
  const allNodes = useMemo(() => getAllNodes(root), [root]);

  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W + (n.spouse ? SPOUSE_GAP + NODE_W : 0)));
  const maxY = Math.max(...allNodes.map((n) => n.y + NODE_H));
  const svgW = maxX + 40;
  const svgH = maxY + 40;

  useEffect(() => {
    onDimensionsChange?.(svgW, svgH);
  }, [svgW, svgH, onDimensionsChange]);

  const computedViewBox = externalViewBox || `0 0 ${svgW} ${svgH}`;

  return (
    <svg
      viewBox={computedViewBox}
      className={externalViewBox ? "w-full h-full absolute inset-0" : "w-full h-auto"}
      preserveAspectRatio="xMidYMin meet"
    >
      {/* Shared clipPath for circular profile images */}
      <defs>
        <clipPath id="circle-clip" clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
      </defs>

      {/* Spouse bracket - solid line bundling couple as one unit */}
      {allNodes.filter((n) => n.spouse).map((node) => {
        const bracketY = node.y + NODE_H / 2;
        return (
          <g key={`spouse-${node.person.id}`}>
            {/* Horizontal bracket connecting couple */}
            <line
              x1={node.x + NODE_W} y1={bracketY}
              x2={node.x + NODE_W + SPOUSE_GAP} y2={bracketY}
              stroke="#C94040" strokeWidth={2}
            />
            {/* Small heart at center */}
            <text
              x={node.x + NODE_W + SPOUSE_GAP / 2}
              y={bracketY - 6}
              textAnchor="middle"
              fontSize={8}
              fill="#C94040"
              opacity={0.6}
            >
              ♥
            </text>
          </g>
        );
      })}

      {/* Links - from couple bracket center down to children's couple bracket center */}
      {allNodes.map((node) => {
        if (node.children.length === 0) return null;

        // Parent connection point: center of couple bracket (or center of single node)
        const parentX = node.spouse
          ? node.x + NODE_W + SPOUSE_GAP / 2
          : node.x + NODE_W / 2;
        const parentY = node.y + NODE_H;
        const midY = parentY + V_GAP / 2;

        // Child connection points: center of couple bracket if has spouse, else center of node
        const childXs = node.children.map((c) =>
          c.spouse
            ? c.x + NODE_W + SPOUSE_GAP / 2
            : c.x + NODE_W / 2
        );
        const minChildX = Math.min(...childXs);
        const maxChildX = Math.max(...childXs);

        return (
          <g key={`links-${node.person.id}`}>
            {/* Vertical from parent bracket down to mid */}
            <line x1={parentX} y1={parentY} x2={parentX} y2={midY}
              stroke="#D4C8BA" strokeWidth={2} opacity={0.8} />
            {/* Horizontal bar across children */}
            {node.children.length > 1 && (
              <line x1={minChildX} y1={midY} x2={maxChildX} y2={midY}
                stroke="#D4C8BA" strokeWidth={2} opacity={0.8} />
            )}
            {/* Vertical from mid down to each child's couple center */}
            {node.children.map((child, ci) => {
              const cx = childXs[ci];
              return (
                <line key={`drop-${child.person.id}`}
                  x1={cx} y1={midY} x2={cx} y2={child.y}
                  stroke="#D4C8BA" strokeWidth={2} opacity={0.8} />
              );
            })}
          </g>
        );
      })}

      {/* Nodes */}
      {allNodes.map((node) => (
        <g key={node.person.id}>
          <a href={`/members/${node.person.id}/`} onClick={(e) => { if (isDragging) e.preventDefault(); }}>
            <ModernNode person={node.person} x={node.x} y={node.y} />
          </a>
          {node.spouse && (
            <a href={`/members/${node.spouse.id}/`} onClick={(e) => { if (isDragging) e.preventDefault(); }}>
              <ModernNode
                person={node.spouse}
                x={node.x + NODE_W + SPOUSE_GAP}
                y={node.y}
              />
            </a>
          )}
        </g>
      ))}
    </svg>
  );
}

function ModernNode({ person, x, y }: { person: TreePerson; x: number; y: number }) {
  const isMale = person.gender === "MALE";
  const isHighlighted = person.isHighlighted === true;
  const bgColor = isHighlighted ? "#F5E8DC" : (isMale ? "#F0F4F8" : "#FFF1F0");
  const borderColor = isHighlighted ? "#A0604B" : (isMale ? "#B4CBDB" : "#E8B4B4");
  const accentColor = isMale ? "#4A7A9B" : "#C94040";

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;

  return (
    <g className="cursor-pointer hover:opacity-80" style={{ transition: "opacity 0.2s" }}>
      {/* Highlight glow for "나 찾기" */}
      {isHighlighted && (
        <rect
          x={x - 3}
          y={y - 3}
          width={NODE_W + 6}
          height={NODE_H + 6}
          rx={19}
          fill="none"
          stroke="#A0604B"
          strokeWidth={2.5}
          opacity={0.6}
          className="animate-pulse"
        />
      )}
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={16}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={isHighlighted ? 2 : 1.5}
        opacity={person.isAlive ? 1 : 0.6}
      />

      {/* Avatar circle with profile image or initial */}
      <circle
        cx={x + 28}
        cy={y + NODE_H / 2}
        r={18}
        fill={accentColor}
        opacity={0.15}
      />
      {person.profileImage ? (
        <image
          href={person.profileImage}
          x={x + 28 - 17}
          y={y + NODE_H / 2 - 17}
          width={34}
          height={34}
          clipPath="url(#circle-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          x={x + 28}
          y={y + NODE_H / 2 + 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill={accentColor}
        >
          {person.nameKorean.charAt(0)}
        </text>
      )}

      {/* Name */}
      <text
        x={x + 55}
        y={y + NODE_H / 2 - 4}
        fontSize={13}
        fontWeight="bold"
        fill="#2C1810"
        fontFamily='"Pretendard Variable", "Pretendard", "Inter", sans-serif'
      >
        {person.nameKorean}
      </text>

      {/* Birth year */}
      {birthYear && (
        <text
          x={x + 55}
          y={y + NODE_H / 2 + 14}
          fontSize={10}
          fill="#A89888"
        >
          {birthYear}년생
          {!person.isAlive && " (작고)"}
        </text>
      )}

      {/* Gender indicator */}
      <circle
        cx={x + NODE_W - 12}
        cy={y + 12}
        r={4}
        fill={accentColor}
      />
    </g>
  );
}
