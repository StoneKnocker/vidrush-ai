import { createRequestHandler, RouterContextProvider } from "react-router";
import { getCloudflareContext } from "@/lib/cf.server";

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
  },
} satisfies ExportedHandler<Env>;
