"use client";

import { useMemo } from "react";
import "@/styles/traditional-tree.css";
import type { TreePerson } from "@/types/tree";

interface TraditionalTreeProps {
  data: TreePerson;
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

export function TraditionalTree({ data }: TraditionalTreeProps) {
  const root = useMemo(() => layoutTree(data), [data]);
  const allNodes = useMemo(() => getAllNodes(root), [root]);

  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W + (n.spouse ? NODE_W + SPOUSE_GAP : 0)));
  const maxY = Math.max(...allNodes.map((n) => n.y + NODE_H));
  const svgW = maxX + 100;
  const svgH = maxY + 100;

  // Find max generation
  const maxGen = Math.max(...allNodes.map((n) => n.person.generation));

  return (
    <div className="traditional-tree-container flex justify-center p-8">
      <svg width={svgW} height={svgH} className="overflow-visible">
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

        {/* Links - vertical/horizontal only for traditional style */}
        {allNodes.map((node) => {
          if (node.children.length === 0) return null;
          const parentX = node.x + NODE_W / 2;
          const parentY = node.y + 50 + NODE_H;

          // Vertical line from parent down
          const childY = node.children[0].y + 50;
          const midY = (parentY + childY) / 2;

          return (
            <g key={`links-${node.person.id}`}>
              {/* Vertical line from parent */}
              <line
                x1={parentX}
                y1={parentY}
                x2={parentX}
                y2={midY}
                className="traditional-link"
              />

              {/* Horizontal connector */}
              {node.children.length > 1 && (
                <line
                  x1={node.children[0].x + NODE_W / 2}
                  y1={midY}
                  x2={node.children[node.children.length - 1].x + NODE_W / 2}
                  y2={midY}
                  className="traditional-link"
                />
              )}

              {/* Vertical lines to children */}
              {node.children.map((child) => (
                <line
                  key={`link-${child.person.id}`}
                  x1={child.x + NODE_W / 2}
                  y1={midY}
                  x2={child.x + NODE_W / 2}
                  y2={childY}
                  className="traditional-link"
                />
              ))}
            </g>
          );
        })}

        {/* Spouse links */}
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

        {/* Nodes */}
        {allNodes.map((node) => (
          <g key={`node-${node.person.id}`}>
            <TraditionalNode person={node.person} x={node.x} y={node.y + 50} />
            {node.spouse && (
              <TraditionalNode
                person={node.spouse}
                x={node.x + NODE_W + SPOUSE_GAP}
                y={node.y + 50}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function TraditionalNode({ person, x, y }: { person: TreePerson; x: number; y: number }) {
  const isMale = person.gender === "MALE";
  const nodeClass = `traditional-node ${isMale ? "male" : "female"} ${!person.isAlive ? "deceased" : ""}`;

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;

  const displayName = person.nameHanja || person.nameKorean;

  return (
    <g className={nodeClass}>
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={2}
      />

      {/* Name - vertical style approximation */}
      {displayName.split("").map((char, i) => (
        <text
          key={i}
          x={x + NODE_W / 2}
          y={y + 22 + i * 20}
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
