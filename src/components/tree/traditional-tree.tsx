"use client";

import { useMemo, useEffect } from "react";
import "@/styles/traditional-tree.css";
import type { TreePerson } from "@/types/tree";

interface TraditionalTreeProps {
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

const NODE_W = 80;
const NODE_H = 120;
const H_GAP = 30;
const V_GAP = 80;
const SPOUSE_GAP = 10;

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

export function TraditionalTree({ data, viewBox: externalViewBox, isDragging, onDimensionsChange }: TraditionalTreeProps) {
  const root = useMemo(() => {
    const tree = layoutTree(data);
    const all = getAllNodes(tree);
    const minX = Math.min(...all.map((n) => n.x));
    const PAD = 40;
    if (minX < PAD) {
      shiftTree(tree, PAD - minX);
    }
    return tree;
  }, [data]);
  const allNodes = useMemo(() => getAllNodes(root), [root]);

  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W + (n.spouse ? NODE_W + SPOUSE_GAP : 0)));
  const maxY = Math.max(...allNodes.map((n) => n.y + NODE_H));
  const svgW = maxX + 100;
  const svgH = maxY + 100;

  useEffect(() => {
    onDimensionsChange?.(svgW, svgH);
  }, [svgW, svgH, onDimensionsChange]);

  // Find max generation
  const maxGen = Math.max(...allNodes.map((n) => n.person.generation));

  const computedViewBox = externalViewBox || `0 0 ${svgW} ${svgH}`;

  return (
    <svg
      viewBox={computedViewBox}
      className={externalViewBox ? "w-full h-full absolute inset-0" : "w-full h-auto"}
      preserveAspectRatio="xMidYMin meet"
    >
      {/* Shared clipPath for circular profile images */}
      <defs>
        <clipPath id="trad-circle-clip" clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
      </defs>

      {/* Title */}
      <text
        x={svgW / 2}
        y={30}
        className="tree-title"
        textAnchor="middle"
      >
        {data.nameKorean ? `${data.nameKorean.charAt(0)}씨 가계도` : "가계도"}
      </text>

      {/* Generation labels */}
      {Array.from({ length: maxGen + 1 }, (_, i) => (
        <text
          key={`gen-${i}`}
          x={15}
          y={i * (NODE_H + V_GAP) + 50 + NODE_H / 2}
          className="generation-label"
        >
          {i + 1}世
        </text>
      ))}

      {/* Spouse bracket - solid line bundling couple */}
      {allNodes.filter((n) => n.spouse).map((node) => (
        <line
          key={`spouse-link-${node.person.id}`}
          x1={node.x + NODE_W}
          y1={node.y + 50 + NODE_H / 2}
          x2={node.x + NODE_W + SPOUSE_GAP}
          y2={node.y + 50 + NODE_H / 2}
          className="traditional-spouse-link"
        />
      ))}

      {/* Links - from couple bracket center down to children's couple center */}
      {allNodes.map((node) => {
        if (node.children.length === 0) return null;

        // Parent connection: center of couple bracket or center of single node
        const parentX = node.spouse
          ? node.x + NODE_W + SPOUSE_GAP / 2
          : node.x + NODE_W / 2;
        const parentY = node.y + 50 + NODE_H;

        const childY = node.children[0].y + 50;
        const midY = (parentY + childY) / 2;

        // Child connection: center of couple bracket if has spouse
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
            <line
              x1={parentX} y1={parentY}
              x2={parentX} y2={midY}
              className="traditional-link"
            />

            {/* Horizontal bar across children */}
            {node.children.length > 1 && (
              <line
                x1={minChildX} y1={midY}
                x2={maxChildX} y2={midY}
                className="traditional-link"
              />
            )}

            {/* Vertical from mid down to each child's couple center */}
            {node.children.map((child, ci) => {
              const cx = childXs[ci];
              return (
                <line
                  key={`link-${child.person.id}`}
                  x1={cx} y1={midY}
                  x2={cx} y2={childY}
                  className="traditional-link"
                />
              );
            })}
          </g>
        );
      })}

      {/* Nodes */}
      {allNodes.map((node) => (
        <g key={`node-${node.person.id}`}>
          <a href={`/members/${node.person.id}/`} onClick={(e) => { if (isDragging) e.preventDefault(); }}>
            <TraditionalNode person={node.person} x={node.x} y={node.y + 50} />
          </a>
          {node.spouse && (
            <a href={`/members/${node.spouse.id}/`} onClick={(e) => { if (isDragging) e.preventDefault(); }}>
              <TraditionalNode
                person={node.spouse}
                x={node.x + NODE_W + SPOUSE_GAP}
                y={node.y + 50}
              />
            </a>
          )}
        </g>
      ))}
    </svg>
  );
}

function TraditionalNode({ person, x, y }: { person: TreePerson; x: number; y: number }) {
  const isMale = person.gender === "MALE";
  const nodeClass = `traditional-node cursor-pointer ${isMale ? "male" : "female"} ${!person.isAlive ? "deceased" : ""}`;

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;

  const displayName = person.nameHanja || person.nameKorean;
  const hasPhoto = !!person.profileImage;

  return (
    <g className={nodeClass}>
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={2}
      />

      {/* Small profile photo at top */}
      {hasPhoto && (
        <>
          <circle cx={x + NODE_W / 2} cy={y + 14} r={11} fill="#fff" opacity={0.6} />
          <image
            href={person.profileImage}
            x={x + NODE_W / 2 - 10}
            y={y + 4}
            width={20}
            height={20}
            clipPath="url(#trad-circle-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      )}

      {/* Name - vertical style approximation */}
      {displayName.split("").map((char, i) => (
        <text
          key={i}
          x={x + NODE_W / 2}
          y={y + (hasPhoto ? 34 : 22) + i * 20}
          textAnchor="middle"
          className={person.nameHanja ? "name-hanja" : "name-korean"}
        >
          {char}
        </text>
      ))}

      {/* Korean name if hanja displayed */}
      {person.nameHanja && (
        <text
          x={x + NODE_W / 2}
          y={y + NODE_H - 20}
          textAnchor="middle"
          className="name-korean"
        >
          {person.nameKorean}
        </text>
      )}

      {/* Birth year */}
      {birthYear && (
        <text
          x={x + NODE_W / 2}
          y={y + NODE_H - 6}
          textAnchor="middle"
          className="birth-year"
        >
          {birthYear}
        </text>
      )}
    </g>
  );
}
