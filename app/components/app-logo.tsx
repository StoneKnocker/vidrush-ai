import { useAppName } from "@/lib/public-env";
import { Link } from "./i18n-link";

export function AppLogo() {
  return (
    <Link
      to="/"
      className="group flex shrink-0 cursor-pointer items-center gap-3"
    >
      <div className="flex size-11 items-center justify-center rounded-md bg-[#101010] transition-all group-hover:shadow-[0_0_18px_rgba(0,217,146,0.24)]">
        <img
          src="/logo.png"
          alt="Logo"
          className="size-7 animate-signal-pulse"
        />
      </div>
      <span className="font-semibold text-current text-xl tracking-tight">
        {useAppName()}
      </span>
    </Link>
  );
}
