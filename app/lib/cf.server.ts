import type { RouterContextProvider } from "react-router";

type CloudflareContext = RouterContextProvider["cloudflare"] & {
  request?: Request;
};

let instance: CloudflareContext | null = null;

export const getCloudflareContext = (value?: CloudflareContext) => {
  if (value) {
    instance = value;
  }
  return instance;
};

function getCfStringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const getCountry = () =>
  getCfStringValue(getCloudflareContext()?.request?.cf?.country);
export const getCity = () =>
  getCfStringValue(getCloudflareContext()?.request?.cf?.city);
