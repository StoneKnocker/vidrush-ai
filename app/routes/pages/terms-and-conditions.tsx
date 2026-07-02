import { FileTextIcon } from "lucide-react";
import { PolicyPage, policyMeta } from "~/components/content/policy-page";
import { policyLoader } from "~/lib/content/policy.server";
import { DEFAULT_APP_NAME } from "~/lib/public-env.shared";
import type { Route } from "./+types/terms-and-conditions";

export const meta: Route.MetaFunction = ({ data, params }) => {
  return policyMeta({
    appName: data?.appName || DEFAULT_APP_NAME,
    params,
    type: "terms",
  });
};

export default function TermsAndConditionsRoute({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <PolicyPage
      icon={FileTextIcon}
      type="terms"
      params={params}
      loaderData={loaderData}
    />
  );
}

export async function loader(args: Route.LoaderArgs) {
  return policyLoader({ ...args, filePattern: "terms-and-conditions" });
}
