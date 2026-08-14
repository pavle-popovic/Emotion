import type { DanceStyle, Tier } from "./types";

export type MuxStatus = "none" | "uploading" | "waiting" | "asset_created" | "preparing" | "ready" | "errored" | string;

export type AdminLesson = {
  id: number;
  module_id: number;
  title: string;
  body: string;
  duration_seconds: number;
  is_preview: boolean;
  sort_order: number;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
  mux_upload_id: string | null;
  mux_status: MuxStatus;
};

export type AdminModule = {
  id: number;
  course_id: number;
  title: string;
  description: string;
  sort_order: number;
  lessons: AdminLesson[];
};

export type AdminCourse = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  style: DanceStyle;
  required_tier: Tier;
  is_published: boolean;
  sort_order: number;
  cover_image_url: string | null;
  lesson_count: number;
};

export type AdminCourseDetail = AdminCourse & { modules: AdminModule[] };

export type DirectUpload = { upload_id: string; upload_url: string };

/** Mux states that mean "still working" - the admin UI keeps polling on these. */
export const PENDING_STATUSES = new Set<MuxStatus>([
  "uploading",
  "waiting",
  "asset_created",
  "preparing",
]);
