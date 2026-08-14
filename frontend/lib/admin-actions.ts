"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, api, getCurrentUser } from "./api";
import type { AdminCourse, AdminCourseDetail, AdminLesson, DirectUpload } from "./admin-types";
import type { DanceStyle, Tier } from "./types";

/**
 * Every admin action re-checks the role server-side. The pages already redirect
 * non-admins, but a page guard is a UI convenience, not an authorisation check -
 * actions are directly invocable.
 */
async function assertAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");
}

export type ActionState = { error: string | null };

function message(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.message ? err.message : fallback;
}

export async function listCourses(): Promise<AdminCourse[]> {
  await assertAdmin();
  return api<AdminCourse[]>("/admin/courses");
}

export async function getCourse(id: number): Promise<AdminCourseDetail | null> {
  await assertAdmin();
  try {
    return await api<AdminCourseDetail>(`/admin/courses/${id}`);
  } catch {
    return null;
  }
}

export async function createCourse(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!title || !slug) return { error: "Title and slug are both required." };

  let created: AdminCourse;
  try {
    created = await api<AdminCourse>("/admin/courses", {
      method: "POST",
      body: JSON.stringify({
        title,
        slug,
        style: String(formData.get("style") ?? "all_styles") as DanceStyle,
        required_tier: String(formData.get("required_tier") ?? "member") as Tier,
        summary: String(formData.get("summary") ?? ""),
      }),
    });
  } catch (err) {
    return { error: message(err, "Could not create the course.") };
  }
  redirect(`/admin/courses/${created.id}`);
}

export async function updateCourse(id: number, formData: FormData): Promise<void> {
  await assertAdmin();
  await api(`/admin/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      description: String(formData.get("description") ?? ""),
      style: String(formData.get("style") ?? "all_styles"),
      required_tier: String(formData.get("required_tier") ?? "member"),
      is_published: formData.get("is_published") === "on",
    }),
  });
  revalidatePath("/", "layout");
}

export async function deleteCourse(id: number): Promise<void> {
  await assertAdmin();
  await api(`/admin/courses/${id}`, { method: "DELETE" });
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function createModule(courseId: number, formData: FormData): Promise<void> {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await api(`/admin/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteModule(moduleId: number, courseId: number): Promise<void> {
  await assertAdmin();
  await api(`/admin/modules/${moduleId}`, { method: "DELETE" });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLesson(
  moduleId: number,
  courseId: number,
  formData: FormData,
): Promise<void> {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await api(`/admin/modules/${moduleId}/lessons`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(
  lessonId: number,
  courseId: number,
  patch: Partial<Pick<AdminLesson, "title" | "body" | "is_preview">>,
): Promise<void> {
  await assertAdmin();
  await api(`/admin/lessons/${lessonId}`, { method: "PATCH", body: JSON.stringify(patch) });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: number, courseId: number): Promise<void> {
  await assertAdmin();
  await api(`/admin/lessons/${lessonId}`, { method: "DELETE" });
  revalidatePath(`/admin/courses/${courseId}`);
}

// --- ordering -----------------------------------------------------------

/** Swap an item with its neighbour and send the whole resulting order. */
function moved(ids: number[], id: number, direction: -1 | 1): number[] | null {
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export async function moveModule(
  courseId: number,
  moduleId: number,
  direction: -1 | 1,
): Promise<void> {
  await assertAdmin();
  const course = await api<AdminCourseDetail>(`/admin/courses/${courseId}`);
  const ids = moved(course.modules.map((m) => m.id), moduleId, direction);
  if (!ids) return;

  await api(`/admin/courses/${courseId}/modules/order`, {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/", "layout");
}

export async function moveLesson(
  courseId: number,
  moduleId: number,
  lessonId: number,
  direction: -1 | 1,
): Promise<void> {
  await assertAdmin();
  const course = await api<AdminCourseDetail>(`/admin/courses/${courseId}`);
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return;

  const ids = moved(module.lessons.map((l) => l.id), lessonId, direction);
  if (!ids) return;

  await api(`/admin/modules/${moduleId}/lessons/order`, {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/", "layout");
}

// --- video --------------------------------------------------------------

export async function startVideoUpload(lessonId: number): Promise<DirectUpload> {
  await assertAdmin();
  return api<DirectUpload>(`/admin/lessons/${lessonId}/video/upload`, { method: "POST" });
}

export async function syncVideo(lessonId: number): Promise<AdminLesson> {
  await assertAdmin();
  const lesson = await api<AdminLesson>(`/admin/lessons/${lessonId}/video/sync`, {
    method: "POST",
  });
  if (lesson.mux_status === "ready") revalidatePath("/", "layout");
  return lesson;
}

export async function removeVideo(lessonId: number, courseId: number): Promise<void> {
  await assertAdmin();
  await api(`/admin/lessons/${lessonId}/video`, { method: "DELETE" });
  revalidatePath(`/admin/courses/${courseId}`);
}
