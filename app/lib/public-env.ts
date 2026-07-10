import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import { DEFAULT_APP_NAME, type PublicEnv } from "./public-env.shared";

export function usePublicEnv() {
  return useRouteLoaderData<typeof rootLoader>("root")?.ENV as
    | PublicEnv
    | undefined;
}

export function useSupportEmail() {
  return usePublicEnv()?.SEND_FROM_EMAIL ?? "";
}
export function useAppName() {
  return usePublicEnv()?.APP_NAME ?? DEFAULT_APP_NAME;
}
export function useR2Domain() {
  return usePublicEnv()?.R2_DOMAIN ?? "";
}
