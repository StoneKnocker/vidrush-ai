import { useAppName } from "@/lib/public-env";
import { Link } from "./i18n-link";

export function AppLogo() {
  const appName = useAppName();
  return (
    <Link
      to="/"
      className="group flex shrink-0 cursor-pointer items-center gap-3"
    >
      <div className="flex size-11 items-center justify-center rounded-md bg-card transition-all group-hover:shadow-[0_0_18px_rgba(0,217,146,0.24)]">
        <img src="/logo.png" alt={appName} className="size-7" />
      </div>
      <span className="font-semibold text-current text-xl tracking-tight">
        {appName}
      </span>
    </Link>
  );
}
