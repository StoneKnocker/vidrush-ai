import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Loading } from "~/components/ui/loading";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const isPopup = searchParams.get("popup") === "true";

        // Wait a bit for Better Auth to process the callback
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Invalidate auth queries to get the updated session
        await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

        if (isPopup && window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_SUCCESS" },
            window.location.origin,
          );
        }

        setTimeout(() => window.close(), 500);
      } catch (err) {
        console.error("OAuth callback error:", err);

        if (searchParams.get("popup") === "true" && window.opener) {
          window.opener.postMessage(
            {
              type: "OAUTH_ERROR",
              error: getErrorMessage(err, "Authentication failed"),
            },
            window.location.origin,
          );
        }

        setTimeout(() => window.close(), 2000);
      }
    };

    handleCallback();
  }, [queryClient, searchParams]);

  return <Loading fullScreen />;
}
