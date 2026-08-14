import "server-only";

import { readToken } from "./session";
import type { CourseDetail, CourseSummary, Dashboard, DanceStyle, LessonDetail, User } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type FetchOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? readToken() : null;

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // non-JSON error body; the status line is all we have
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Null rather than throwing, so a signed-out visitor renders the public view. */
export async function getCurrentUser(): Promise<User | null> {
  if (!readToken()) return null;
  try {
    return await api<User>("/me");
  } catch {
    return null;
  }
}

export async function listCourses(style?: DanceStyle): Promise<CourseSummary[]> {
  const query = style ? `?style=${encodeURIComponent(style)}` : "";
  try {
    return await api<CourseSummary[]>(`/courses${query}`);
  } catch {
    // A cold or unreachable API should render an empty catalog, not a 500 page.
    return [];
  }
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    return await api<CourseDetail>(`/courses/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

/** Distinguishes "locked" (402) from "missing" so the page can show a paywall. */
export async function getLesson(
  id: number,
): Promise<{ lesson: LessonDetail } | { locked: true } | null> {
  try {
    return { lesson: await api<LessonDetail>(`/lessons/${id}`) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 402) return { locked: true };
    return null;
  }
}

export async function getDashboard(): Promise<Dashboard | null> {
  try {
    return await api<Dashboard>("/me/dashboard");
  } catch {
    return null;
  }
}
