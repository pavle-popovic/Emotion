"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, api } from "./api";
import { clearToken, writeToken } from "./session";
import type { DanceStyle, User } from "./types";

export type FormState = { error: string | null };

const GENERIC_ERROR = "Something went wrong. Try again.";

function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  return fallback;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const { access_token } = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    writeToken(access_token);
  } catch (err) {
    return { error: messageFor(err, "Incorrect email or password.") };
  }
  redirect("/dashboard");
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  try {
    const { access_token } = await api<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
      auth: false,
    });
    writeToken(access_token);
  } catch (err) {
    return { error: messageFor(err, GENERIC_ERROR) };
  }
  redirect("/start");
}

export async function logout(): Promise<void> {
  clearToken();
  redirect("/");
}

export async function chooseStyle(style: DanceStyle): Promise<void> {
  await api<User>("/me/onboarding", {
    method: "POST",
    body: JSON.stringify({ preferred_style: style }),
  });
  redirect("/dashboard");
}

export async function startTrial(): Promise<void> {
  await api<User>("/me/start-trial", { method: "POST" });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function enroll(slug: string): Promise<void> {
  await api(`/courses/${encodeURIComponent(slug)}/enroll`, { method: "POST" });
  revalidatePath(`/courses/${slug}`);
}

export async function setLessonProgress(lessonId: number, completed: boolean): Promise<void> {
  await api(`/lessons/${lessonId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ completed }),
  });
  // The lesson page, the course page and the dashboard all show this state.
  revalidatePath("/", "layout");
}
