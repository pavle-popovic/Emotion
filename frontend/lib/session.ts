import { cookies } from "next/headers";

export const TOKEN_COOKIE = "emotion_token";

/** Matches ACCESS_TOKEN_MINUTES on the backend (24h). */
const MAX_AGE_SECONDS = 60 * 60 * 24;

export function readToken(): string | null {
  return cookies().get(TOKEN_COOKIE)?.value ?? null;
}

/**
 * httpOnly so the JWT is never readable from JavaScript. The token is issued by
 * FastAPI and only ever travels between this server and the API.
 */
export function writeToken(token: string): void {
  cookies().set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearToken(): void {
  cookies().delete(TOKEN_COOKIE);
}
