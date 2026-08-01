export type RoadmapStatus = "pending" | "completed";

export interface RoadmapItem {
  id: string;
  title: string;
  status: RoadmapStatus;
  /** ISO 8601 timestamp */
  createdTime: string;
}

export interface Roadmap {
  items: RoadmapItem[];
}

export const formatRoadmapCreatedTime = (
  createdTime: string,
  locale: string
): string => {
  const date = new Date(createdTime);
  if (Number.isNaN(date.getTime())) {
    return createdTime;
  }
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
