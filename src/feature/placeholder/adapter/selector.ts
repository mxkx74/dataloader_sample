import type { PlaceholderFindAllOutputPort } from "../use-case/queries/boundary";

export type PlaceholderRow = {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
};

export const selectPlaceholderRows = (
  data: PlaceholderFindAllOutputPort
): PlaceholderRow[] => {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    completed: item.completed,
    userId: item.userId,
  }));
};
