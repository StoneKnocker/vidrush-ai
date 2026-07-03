/// <reference path="../../worker-configuration.d.ts" />
import { env as cloudflareEnv } from "cloudflare:workers";
import { z } from "zod";

/**
 * Server environment schema definition with validation rules
 */
const serverEnvSchema = z.object({
  ENVIRONMENT: z.enum(["development", "production"]).default("development"),
  NEED_MOCK: z.string().optional().default("0"),
  APP_NAME: z.string().min(1).optional(),
  APP_URL: z.string().min(1).optional(),
  R2_DOMAIN: z.string().min(1).optional(),

  R2_BUCKET_NAME: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  SEND_FROM_EMAIL: z.string().min(1),

  // Add other server-only variables here...
});

/**
 * Validated server environment variables
 */
const checkedEnv = (() => {
  const parsed = serverEnvSchema.safeParse(cloudflareEnv);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const validatedData = parsed.data;
  Object.freeze(validatedData); // Ensure immutability

  // Only log in development for better production security
  if (validatedData.ENVIRONMENT === "development") {
    console.log(`✅ Environment: ${validatedData.ENVIRONMENT}`);
  }

  return validatedData;
})();

// Environment convenience exports
export const isDevelopment = checkedEnv.ENVIRONMENT === "development";

/**
 * Returns a subset of environment variables that are safe to expose to the client.
 * SECURITY WARNING: Be careful what you expose here - never include API keys,
 * secrets, or sensitive information as these will be visible in the browser.
 */
export function getPublicEnv() {
  return {
    SEND_FROM_EMAIL: checkedEnv.SEND_FROM_EMAIL,
    APP_NAME: checkedEnv.APP_NAME,
    APP_URL: checkedEnv.APP_URL,
    R2_DOMAIN: checkedEnv.R2_DOMAIN,
  };
}
