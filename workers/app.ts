import { createRequestHandler, RouterContextProvider } from "react-router";
import { getCloudflareContext } from "@/lib/cf.server";
import { recoverStaleTripoTasks } from "@/lib/service/tripoService";

declare module "react-router" {
  export interface RouterContextProvider {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    try {
      const context = new RouterContextProvider();
      getCloudflareContext({ env, ctx, request });
      return await requestHandler(
        request,
        Object.assign(context, {
          cloudflare: { env, ctx },
        }),
      );
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
  async scheduled(_controller, env, ctx) {
    getCloudflareContext({ env, ctx });
    ctx.waitUntil(
      recoverStaleTripoTasks()
        .then((result) => {
          console.info("Recovered stale Tripo tasks:", result);
        })
        .catch((error) => {
          console.error("Failed to recover stale Tripo tasks:", error);
        }),
    );
  },
} satisfies ExportedHandler<Env>;
