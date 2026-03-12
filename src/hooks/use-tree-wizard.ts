"use client";

import { useState, useCallback } from "react";
import { useMembers } from "./use-members";
import { useRelationships } from "./use-relationships";
import { Timestamp } from "firebase/firestore";
import type { FamilyMember } from "@/types/family";

export type WizardStep = "spouse" | "father" | "mother" | "siblings" | "children" | "preview";

const STEPS: WizardStep[] = ["spouse", "father", "mother", "siblings", "children", "preview"];

export interface WizardMemberInput {
  nameKorean: string;
  gender: "MALE" | "FEMALE";
  birthDate?: string; // YYYY-MM-DD
}

export interface WizardState {
  currentStep: WizardStep;
  selfId: string;
  selfGeneration: number;
  selfGender: "MALE" | "FEMALE";
  spouseId?: string;
  fatherId?: string;
  motherId?: string;
  siblingIds: string[];
  childIds: string[];
}

export function useTreeWizard(
  familyId: string | undefined,
  selfId: string,
  selfGeneration: number,
  selfGender: "MALE" | "FEMALE"
) {
  const { addMember } = useMembers(familyId);
  const { addRelationship } = useRelationships(familyId);
  const [submitting, setSubmitting] = useState(false);

  const [state, setState] = useState<WizardState>({
    currentStep: "spouse",
    selfId,
    selfGeneration,
    selfGender,
    siblingIds: [],
    childIds: [],
  });

  const createMember = useCallback(async (
    data: WizardMemberInput,
    generation: number,
    birthOrder: number = 1,
  ): Promise<string | undefined> => {
    const memberData: Omit<FamilyMember, "id" | "createdAt" | "updatedAt"> = {
      nameKorean: data.nameKorean,
      gender: data.gender,
      birthDate: data.birthDate ? Timestamp.fromDate(new Date(data.birthDate)) : undefined,
      isAlive: true,
      generation,
      birthOrder,
    } as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">;

    return await addMember(memberData);
  }, [addMember]);

  const addSpouse = useCallback(async (data: WizardMemberInput) => {
    setSubmitting(true);
    try {
      const spouseId = await createMember(data, selfGeneration);
      if (spouseId) {
        await addRelationship(selfId, spouseId, "SPOUSE");
        setState((prev) => ({ ...prev, spouseId }));
      }
      return spouseId;
    } finally {
      setSubmitting(false);
    }
  }, [createMember, addRelationship, selfId, selfGeneration]);

  const addFather = useCallback(async (data: WizardMemberInput) => {
    setSubmitting(true);
    try {
      const fatherId = await createMember(data, selfGeneration - 1);
      if (fatherId) {
        await addRelationship(fatherId, selfId, "PARENT_CHILD");
        setState((prev) => ({ ...prev, fatherId }));
      }
      return fatherId;
    } finally {
      setSubmitting(false);
    }
  }, [createMember, addRelationship, selfId, selfGeneration]);

  const addMother = useCallback(async (data: WizardMemberInput) => {
    setSubmitting(true);
    try {
      const motherId = await createMember(data, selfGeneration - 1);
      if (motherId) {
        await addRelationship(motherId, selfId, "PARENT_CHILD");
        // 아버지가 있으면 부부 관계도 자동 생성
        if (state.fatherId) {
          await addRelationship(state.fatherId, motherId, "SPOUSE");
        }
        setState((prev) => ({ ...prev, motherId }));
      }
      return motherId;
    } finally {
      setSubmitting(false);
    }
  }, [createMember, addRelationship, selfId, selfGeneration, state.fatherId]);

  const addSibling = useCallback(async (
    data: WizardMemberInput,
    spouseData?: WizardMemberInput
  ) => {
    setSubmitting(true);
    try {
      const birthOrder = state.siblingIds.length + 2; // 본인이 1번
      const siblingId = await createMember(data, selfGeneration, birthOrder);
      if (siblingId) {
        // 부모와 부모-자녀 관계 생성
        if (state.fatherId) {
          await addRelationship(state.fatherId, siblingId, "PARENT_CHILD");
        }
        if (state.motherId) {
          await addRelationship(state.motherId, siblingId, "PARENT_CHILD");
        }

        // 형제 배우자 등록
        if (spouseData) {
          const spouseId = await createMember(spouseData, selfGeneration);
          if (spouseId) {
            await addRelationship(siblingId, spouseId, "SPOUSE");
          }
        }

        setState((prev) => ({
          ...prev,
          siblingIds: [...prev.siblingIds, siblingId],
        }));
      }
      return siblingId;
    } finally {
      setSubmitting(false);
    }
  }, [createMember, addRelationship, selfGeneration, state.fatherId, state.motherId, state.siblingIds.length]);

  const addChild = useCallback(async (data: WizardMemberInput) => {
    setSubmitting(true);
    try {
      const birthOrder = state.childIds.length + 1;
      const childId = await createMember(data, selfGeneration + 1, birthOrder);
      if (childId) {
        await addRelationship(selfId, childId, "PARENT_CHILD");
        if (state.spouseId) {
          await addRelationship(state.spouseId, childId, "PARENT_CHILD");
        }
        setState((prev) => ({
          ...prev,
          childIds: [...prev.childIds, childId],
        }));
      }
      return childId;
    } finally {
      setSubmitting(false);
    }
  }, [createMember, addRelationship, selfId, selfGeneration, state.spouseId, state.childIds.length]);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const idx = STEPS.indexOf(prev.currentStep);
      if (idx < STEPS.length - 1) {
        return { ...prev, currentStep: STEPS[idx + 1] };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const idx = STEPS.indexOf(prev.currentStep);
      if (idx > 0) {
        return { ...prev, currentStep: STEPS[idx - 1] };
      }
      return prev;
    });
  }, []);

  const stepIndex = STEPS.indexOf(state.currentStep);
  const totalSteps = STEPS.length;

  return {
    state,
    submitting,
    stepIndex,
    totalSteps,
    addSpouse,
    addFather,
    addMother,
    addSibling,
    addChild,
    nextStep,
    prevStep,
  };
}
