import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { lastLoginMethod } from "better-auth/plugins";
import { cache } from "react";
import { db } from "~/lib/database/db.server";
import { deleteFromR2 } from "~/lib/r2/r2.server";
import { rewardNewUserCredits } from "~/lib/service/userService";
import { createUserSourceForNewUser } from "~/lib/service/userSourceService";
import { emailOTPConfig } from "./unosendEmailOTP";

type BetterAuthNewUser = {
  id: string;
};

export const serverAuth = betterAuth({
  baseURL: env.APP_URL,
  trustedOrigins: [env.APP_URL],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user: BetterAuthNewUser) => {
          await rewardNewUserCredits(user.id);
        },
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Handle user source creation after successful authentication
      const newSession = ctx.context.newSession;
      if (newSession?.user?.id && ctx.request && ctx.headers) {
        console.log("new user session detected, creating user source");
        try {
          await createUserSourceForNewUser(
            newSession.user.id,
            ctx.request,
            ctx.headers,
          );
        } catch (error) {
          // Log error but don't block authentication
          console.error("Failed to create user source:", error);
        }
      }
    }),
  },
  secondaryStorage: {
    get: async (key) => await env.APP_KV.get(`_auth:${key}`, "json"),
    set: async (key, value) =>
      await env.APP_KV.put(`_auth:${key}`, JSON.stringify(value)),
    delete: async (key) => await env.APP_KV.delete(`_auth:${key}`),
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["google", "github"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        if (user.image) {
          await deleteUserImageFromR2(user.image);
        }
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60, // time window in seconds
    max: 10, // max requests in the window
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
    },
  },
  plugins: [lastLoginMethod(), emailOTPConfig],
  emailAndPassword: {
    enabled: false,
  },
});

export const getServerSession = cache(async (request: Request) => {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });
  return session;
});

function getR2ObjectKeyFromImage(imageUrl: string): string | null {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const parsedImageUrl = new URL(imageUrl);
      const parsedR2Domain = new URL(env.R2_DOMAIN);

      if (parsedImageUrl.host !== parsedR2Domain.host) {
        return null;
      }

      return parsedImageUrl.pathname.replace(/^\/+/, "") || null;
    } catch {
      return null;
    }
  }

  let key = imageUrl.split("?").at(0)?.replace(/^\/+/, "") ?? "";
  if (key.startsWith("images/")) {
    key = key.slice("images/".length);
  }

  return key || null;
}

export const deleteUserImageFromR2 = async (imageUrl: string | null) => {
  if (!imageUrl) return;

  const r2ObjectKey = getR2ObjectKeyFromImage(imageUrl);
  if (r2ObjectKey) {
    await deleteFromR2(r2ObjectKey);
  }
};

export type AuthServerSession = Awaited<
  ReturnType<typeof serverAuth.api.getSession>
>;
