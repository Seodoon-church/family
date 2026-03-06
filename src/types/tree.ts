export interface TreePerson {
  id: string;
  nameKorean: string;
  nameHanja?: string;
  gender: "MALE" | "FEMALE";
  birthDate?: string;
  deathDate?: string;
  isAlive: boolean;
  profileImage?: string;
  generation: number;
  birthOrder: number;
  spouse?: TreePerson;
  children: TreePerson[];
}

export type TreeViewMode = "traditional" | "modern";

export interface TreeDimensions {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}
