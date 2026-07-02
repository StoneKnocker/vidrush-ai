import { useEffect } from "react";
import { Loading } from "~/components/ui/loading";
import { authClient } from "~/lib/auth/auth.client";

export default function PopupAuth() {
  useEffect(() => {
    const initiateOAuth = async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: `${window.location.origin}/auth/callback?popup=true`,
        });
      } catch (err) {
        console.error("OAuth initiation failed:", err);
        setTimeout(() => window.close(), 2000);
      }
    };

    initiateOAuth();
  }, []);

  return <Loading fullScreen />;
}
