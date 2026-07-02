import { useEffect, useRef } from "react";

type TwitterWidgets = {
  createTweet: (
    tweetId: string,
    target: HTMLElement,
    options?: {
      align?: "left" | "center" | "right";
      dnt?: boolean;
      theme?: "light" | "dark";
    },
  ) => Promise<HTMLElement>;
};

declare global {
  interface Window {
    twttr?: {
      widgets?: TwitterWidgets;
    };
  }
}

let twitterWidgetsPromise: Promise<void> | null = null;

function loadTwitterWidgetsScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.twttr?.widgets) {
    return Promise.resolve();
  }

  if (twitterWidgetsPromise) {
    return twitterWidgetsPromise;
  }

  twitterWidgetsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.twitter.com/widgets.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load X widgets script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load X widgets script."));
    document.head.appendChild(script);
  });

  return twitterWidgetsPromise;
}

type XPostEmbedProps = {
  tweetId: string;
};

export default function XPostEmbed({ tweetId }: XPostEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void loadTwitterWidgetsScript()
      .then(() => {
        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";

        return window.twttr?.widgets?.createTweet(
          tweetId,
          containerRef.current,
          {
            align: "center",
            dnt: true,
            theme: "light",
          },
        );
      })
      .catch((error) => {
        console.error("Failed to initialize X embed", error);
      });

    return () => {
      cancelled = true;
    };
  }, [tweetId]);

  return <div ref={containerRef} />;
}
