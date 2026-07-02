import type { IconName } from "lucide-react/dynamic";
import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "~/lib/utils";

export type LandingIconName = IconName | (string & {});

export function LandingIcon({
  name,
  className,
}: {
  name?: LandingIconName;
  className?: string;
}) {
  if (!name) {
    return null;
  }

  if (name.startsWith("http")) {
    return <img src={name} alt="icon" className={cn("size-4", className)} />;
  }

  return <DynamicIcon name={name as IconName} className={className} />;
}

export function LandingIconBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-md",
        "border border-[#3d3a39] bg-[#101010] text-[#00d992] shadow-[0_0_15px_rgba(92,88,85,0.2)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
