import { AsyncLocalStorage } from "node:async_hooks";
import type { MiddlewareFunction, RouterContextProvider } from "react-router";
import { createContext, redirect } from "react-router";
import { type AuthServerSession, serverAuth } from "~/lib/auth/auth.server";
import { i18nConfig } from "~/lib/config";

const authStorage = new AsyncLocalStorage<AuthServerSession>();
export const authContext = createContext<AuthServerSession>();

export function getCurrentSession(): AuthServerSession {
  return authStorage.getStore() ?? null;
}

export function getCurrentUser() {
  const session = getCurrentSession();
  return session?.user ?? null;
}

export function requireUser() {
  const session = getCurrentSession();
  if (!session) {
    throw new Error(
      "requireUser() called but no authenticated user found. " +
        "This indicates a programming error - make sure you're using " +
        "requireAuth middleware on this route!",
    );
  }
  return session;
}

export function requireAdmin() {
  const session = requireUser();
  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}

async function processSession(
  request: Request,
  context: Readonly<RouterContextProvider>,
  requireLogin = false,
): Promise<AuthServerSession> {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });

  if (requireLogin && !session?.user) {
    const url = new URL(request.url);
    const pathname = url.pathname || "/";
    const firstSegment = url.pathname.split("/").at(1) || "";
    const localePrefix = i18nConfig.supportLanguages.includes(firstSegment)
      ? `/${firstSegment}`
      : "";
    throw redirect(
      `${localePrefix}/signin?redirectTo=${encodeURIComponent(pathname)}`,
    );
  }

  context.set(authContext, session);
  return session;
}

export const requireAuth: MiddlewareFunction = async (
  { request, context },
  next,
) => {
  const session = await processSession(request, context, true);
  return authStorage.run(session, next);
};

// 设置一个全局可用的 sesison, 但是不要校验授权状态
export const setAuth: MiddlewareFunction = async (
  { request, context },
  next,
) => {
  try {
    const session = await serverAuth.api.getSession({
      headers: request.headers,
    });

    context.set(authContext, session);
    return authStorage.run(session, next);
  } catch (error) {
    console.error("[setAuth] middleware error:", error);
    throw error;
  }
};
