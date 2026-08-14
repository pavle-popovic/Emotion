export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export type CourseSummary = {
  id: number;
  slug: string;
  title: string;
  description: string;
  is_published: boolean;
};

export type Lesson = {
  id: number;
  title: string;
  body: string;
  video_url: string | null;
  duration_seconds: number;
  sort_order: number;
};

export type Module = {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
};

export type CourseDetail = CourseSummary & { modules: Module[] };

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Never throws — a cold backend should render an empty catalog, not a 500 page.
 */
export async function listCourses(): Promise<{ courses: CourseSummary[]; error?: string }> {
  try {
    return { courses: await apiGet<CourseSummary[]>("/courses") };
  } catch (err) {
    return { courses: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/** Returns null when the course is missing or the backend is unreachable. */
export async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    return await apiGet<CourseDetail>(`/courses/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}
