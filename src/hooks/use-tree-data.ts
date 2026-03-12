"use client";

import { useMemo } from "react";
import type { FamilyMember, Relationship } from "@/types/family";
import type { TreePerson } from "@/types/tree";

export function useTreeData(
  members: FamilyMember[],
  relationships: Relationship[],
  familySurname?: string,
  highlightId?: string
): TreePerson | null {
  return useMemo(() => {
    if (members.length === 0) return null;
    const tree = buildTreeData(members, relationships, familySurname);
    if (tree && highlightId) {
      markHighlighted(tree, highlightId);
    }
    return tree;
  }, [members, relationships, familySurname, highlightId]);
}

/** 트리에서 특정 ID의 노드(및 그 배우자)를 하이라이트 표시 */
function markHighlighted(node: TreePerson, targetId: string): boolean {
  if (node.id === targetId) {
    node.isHighlighted = true;
    return true;
  }
  if (node.spouse?.id === targetId) {
    node.spouse.isHighlighted = true;
    return true;
  }
  for (const child of node.children) {
    if (markHighlighted(child, targetId)) return true;
  }
  return false;
}

function buildTreeData(
  members: FamilyMember[],
  relationships: Relationship[],
  familySurname?: string
): TreePerson | null {
  const parentChildRels = relationships.filter((r) => r.type === "PARENT_CHILD");
  const spouseRels = relationships.filter((r) => r.type === "SPOUSE");

  // Find root: a parent who is not a child of anyone
  const childIds = new Set(parentChildRels.map((r) => r.toId));
  const parentIds = new Set(parentChildRels.map((r) => r.fromId));

  const rootCandidates = [...parentIds].filter((id) => !childIds.has(id));
  const rootId =
    rootCandidates.find(
      (id) => members.find((m) => m.id === id)?.gender === "MALE"
    ) || rootCandidates[0];

  if (!rootId) {
    // Fallback: use the member with lowest generation
    const sorted = [...members].sort((a, b) => a.generation - b.generation);
    return memberToTreePerson(sorted[0], members, parentChildRels, spouseRels);
  }

  return buildNode(rootId, members, parentChildRels, spouseRels, familySurname);
}

function buildNode(
  personId: string,
  members: FamilyMember[],
  parentChildRels: Relationship[],
  spouseRels: Relationship[],
  familySurname?: string
): TreePerson | null {
  let person = members.find((m) => m.id === personId);
  if (!person) return null;

  // Find spouse
  const spouseRel =
    spouseRels.find((r) => r.fromId === personId) ||
    spouseRels.find((r) => r.toId === personId);

  const spouseId = spouseRel
    ? spouseRel.fromId === personId
      ? spouseRel.toId
      : spouseRel.fromId
    : undefined;
  let spouse = spouseId ? members.find((m) => m.id === spouseId) : undefined;

  // 안전장치: 가문 성씨 기반 swap
  // spouse가 가문 성씨이고 primary가 외성이면 교체 (한씨 집안 구성원이 항상 왼쪽)
  if (familySurname && person && spouse) {
    const personIsClan = person.surname === familySurname;
    const spouseIsClan = spouse.surname === familySurname;
    if (!personIsClan && spouseIsClan) {
      const temp = person;
      person = spouse;
      spouse = temp;
    }
  }

  // Find children (from this person or their spouse)
  const childRels = parentChildRels.filter(
    (r) => r.fromId === personId || (spouseId && r.fromId === spouseId)
  );
  const uniqueChildIds = [...new Set(childRels.map((r) => r.toId))];

  const children = uniqueChildIds
    .map((childId) => buildNode(childId, members, parentChildRels, spouseRels, familySurname))
    .filter(Boolean)
    .sort(
      (a, b) => (a!.birthOrder || 1) - (b!.birthOrder || 1)
    ) as TreePerson[];

  return {
    id: person.id,
    nameKorean: person.nameKorean,
    nameHanja: person.nameHanja,
    gender: person.gender,
    birthDate: person.birthDate?.toDate?.()?.toISOString(),
    deathDate: person.deathDate?.toDate?.()?.toISOString(),
    isAlive: person.isAlive,
    profileImage: person.profileImage,
    generation: person.generation,
    birthOrder: person.birthOrder,
    spouse: spouse ? memberToTreePerson(spouse, members, [], spouseRels) : undefined,
    children,
  };
}

function memberToTreePerson(
  person: FamilyMember,
  _members: FamilyMember[],
  _parentChildRels: Relationship[],
  _spouseRels: Relationship[]
): TreePerson {
  return {
    id: person.id,
    nameKorean: person.nameKorean,
    nameHanja: person.nameHanja,
    gender: person.gender,
    birthDate: person.birthDate?.toDate?.()?.toISOString(),
    deathDate: person.deathDate?.toDate?.()?.toISOString(),
    isAlive: person.isAlive,
    profileImage: person.profileImage,
    generation: person.generation,
    birthOrder: person.birthOrder,
    children: [],
  };
}
