"use client";

import { useMemo } from "react";
import type { FamilyMember, Relationship } from "@/types/family";
import type { TreePerson } from "@/types/tree";

export function useTreeData(
  members: FamilyMember[],
  relationships: Relationship[]
): TreePerson | null {
  return useMemo(() => {
    if (members.length === 0) return null;
    return buildTreeData(members, relationships);
  }, [members, relationships]);
}

function buildTreeData(
  members: FamilyMember[],
  relationships: Relationship[]
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

  return buildNode(rootId, members, parentChildRels, spouseRels);
}

function buildNode(
  personId: string,
  members: FamilyMember[],
  parentChildRels: Relationship[],
  spouseRels: Relationship[]
): TreePerson | null {
  const person = members.find((m) => m.id === personId);
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
  const spouse = spouseId ? members.find((m) => m.id === spouseId) : undefined;

  // Find children (from this person or their spouse)
  const childRels = parentChildRels.filter(
    (r) => r.fromId === personId || (spouseId && r.fromId === spouseId)
  );
  const uniqueChildIds = [...new Set(childRels.map((r) => r.toId))];

  const children = uniqueChildIds
    .map((childId) => buildNode(childId, members, parentChildRels, spouseRels))
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
