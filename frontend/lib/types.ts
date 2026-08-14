export type DanceStyle = "hip_hop" | "kizomba" | "bachata" | "afrobeats" | "all_styles";
export type Tier = "free" | "member";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  preferred_style: DanceStyle | null;
  is_onboarded: boolean;
  tier: Tier;
  subscription: {
    tier: Tier;
    status: SubscriptionStatus;
    current_period_end: string | null;
  } | null;
};

export type LessonSummary = {
  id: number;
  title: string;
  duration_seconds: number;
  sort_order: number;
  is_preview: boolean;
  is_locked: boolean;
  is_completed: boolean;
  position_seconds: number;
};

export type LessonDetail = LessonSummary & {
  body: string;
  mux_playback_id: string | null;
  module_id: number;
  module_title: string;
  course_slug: string;
  course_title: string;
  previous_lesson_id: number | null;
  next_lesson_id: number | null;
  position: number;
  total_in_course: number;
};

export type Module = {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  lessons: LessonSummary[];
};

export type CourseSummary = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  style: DanceStyle;
  style_label: string;
  cover_image_url: string | null;
  required_tier: Tier;
  lesson_count: number;
  total_duration_seconds: number;
  is_locked: boolean;
  completed_lessons: number;
  progress_percent: number;
};

export type CourseDetail = CourseSummary & {
  description: string;
  modules: Module[];
  is_enrolled: boolean;
  resume_lesson_id: number | null;
};

export type ContinueCard = {
  course_slug: string;
  course_title: string;
  lesson_id: number;
  lesson_title: string;
  position: number;
  total_in_course: number;
  progress_percent: number;
};

export type Dashboard = {
  stats: { lessons_completed: number; courses_completed: number; day_streak: number };
  continue_card: ContinueCard | null;
  courses: CourseSummary[];
};

export const STYLE_ORDER: DanceStyle[] = ["hip_hop", "kizomba", "bachata", "afrobeats"];

export const STYLE_LABELS: Record<DanceStyle, string> = {
  hip_hop: "Hip hop",
  kizomba: "Kizomba",
  bachata: "Bachata",
  afrobeats: "Afrobeats",
  all_styles: "All styles",
};

export const STYLE_HINTS: Record<DanceStyle, string> = {
  hip_hop: "Groove, bounce & freestyle",
  kizomba: "Connection & flow",
  bachata: "Sensual waves & footwork",
  afrobeats: "Energy, legwork & joy",
  all_styles: "Everything at once",
};
