export const DEFAULT_APP_NAME = "CyberRealistic";

export interface PublicEnv {
  SEND_FROM_EMAIL?: string;
  APP_NAME?: string;
  APP_URL?: string;
  R2_DOMAIN?: string;
}

declare global {
  interface Window {
    ENV?: PublicEnv;
  }
}
