import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { recoverStaleTripoTasks } from "~/lib/service/tripoService";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const result = await recoverStaleTripoTasks();
    return data(result);
  } catch (error) {
    console.error("Recover stale Tripo tasks error:", error);
    return data(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
