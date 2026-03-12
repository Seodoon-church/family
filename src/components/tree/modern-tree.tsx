"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TreePerson } from "@/types/tree";

interface ModernTreeProps {
  data: TreePerson;
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

  let totalWidth: number;
  if (childNodes.length === 0) {
    totalWidth = NODE_W + (person.spouse ? NODE_W + SPOUSE_GAP : 0);
  } else {
    totalWidth = childNodes.reduce((sum, c) => sum + getSubtreeWidth(c), 0) + (childNodes.length - 1) * H_GAP;
    const selfWidth = NODE_W + (person.spouse ? NODE_W + SPOUSE_GAP : 0);
    totalWidth = Math.max(totalWidth, selfWidth);
  }

  let xOffset = 0;
  for (const child of childNodes) {
    const w = getSubtreeWidth(child);
    child.x = xOffset + w / 2;
    xOffset += w + H_GAP;
  }

  // Center children under parent
  if (childNodes.length > 0) {
    const shift = (totalWidth - xOffset + H_GAP) / 2;
    for (const child of childNodes) {
      shiftTree(child, shift);
    }
  }

  return {
    person,
    x: totalWidth / 2,
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

export function ModernTree({ data }: ModernTreeProps) {
  const root = useMemo(() => layoutTree(data), [data]);
  const allNodes = useMemo(() => getAllNodes(root), [root]);

  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W));
  const maxY = Math.max(...allNodes.map((n) => n.y + NODE_H));
  const svgW = maxX + 100;
  const svgH = maxY + 60;

  return (
    <div className="flex justify-center p-6">
      <svg width={svgW} height={svgH} className="overflow-visible">
        {/* Links */}
        {allNodes.map((node) =>
          node.children.map((child) => {
            const x1 = node.x + NODE_W / 2;
            const y1 = node.y + NODE_H;
            const x2 = child.x + NODE_W / 2;
            const y2 = child.y;
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={`${node.person.id}-${child.person.id}`}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="#D1D5DB"
                strokeWidth={2}
                opacity={0.8}
              />
            );
          })
        )}

        {/* Spouse Links */}
        {allNodes.filter((n) => n.spouse).map((node) => (
          <line
            key={`spouse-${node.person.id}`}
            x1={node.x + NODE_W}
            y1={node.y + NODE_H / 2}
            x2={node.x + NODE_W + SPOUSE_GAP}
            y2={node.y + NODE_H / 2}
            stroke="#F43F5E"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        ))}

        {/* Nodes */}
        {allNodes.map((node) => (
          <g key={node.person.id}>
            <ModernNode person={node.person} x={node.x} y={node.y} />
            {node.spouse && (
              <ModernNode
                person={node.spouse}
                x={node.x + NODE_W + SPOUSE_GAP}
                y={node.y}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ModernNode({ person, x, y }: { person: TreePerson; x: number; y: number }) {
  const isMale = person.gender === "MALE";
  const isHighlighted = person.isHighlighted === true;
  const bgColor = isHighlighted ? (isMale ? "#DBEAFE" : "#FCE7F3") : (isMale ? "#F0F9FF" : "#FFF1F2");
  const borderColor = isHighlighted ? "#6366F1" : (isMale ? "#7DD3FC" : "#FDA4AF");
  const accentColor = isMale ? "#0EA5E9" : "#F43F5E";

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;

  return (
    <g className="cursor-pointer" style={{ transition: "opacity 0.2s" }}>
      {/* Highlight glow for "나 찾기" */}
      {isHighlighted && (
        <rect
          x={x - 3}
          y={y - 3}
          width={NODE_W + 6}
          height={NODE_H + 6}
          rx={19}
          fill="none"
          stroke="#6366F1"
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
      {/* Avatar circle */}
      <circle
        cx={x + 28}
        cy={y + NODE_H / 2}
        r={18}
        fill={accentColor}
        opacity={0.15}
      />
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

      {/* Name */}
      <text
        x={x + 55}
        y={y + NODE_H / 2 - 4}
        fontSize={13}
        fontWeight="bold"
        fill="#111827"
        fontFamily='"Pretendard", "Inter", sans-serif'
      >
        {person.nameKorean}
      </text>

      {/* Birth year */}
      {birthYear && (
        <text
          x={x + 55}
          y={y + NODE_H / 2 + 14}
          fontSize={10}
          fill="#9CA3AF"
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
