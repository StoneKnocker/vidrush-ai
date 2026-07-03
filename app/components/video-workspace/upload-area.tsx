import type * as React from "react";

import { cn } from "~/lib/utils";

export interface UploadAreaProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  secondaryAction?: {
    label: string;
    icon: React.ReactNode;
  };
  onClick?: () => void;
}

export function UploadArea({
  icon,
  title,
  hint,
  secondaryAction,
  onClick,
  className,
}: UploadAreaProps & { className?: string }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        "flex flex-col items-center justify-center",
        "mt-2.5 h-[184px] w-full py-10",
        "rounded-[10px] border-2 border-muted-foreground/25 border-dashed",
        "cursor-pointer bg-transparent",
        "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:border-muted-foreground/40 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="mb-3 text-muted-foreground [&_svg]:h-8 [&_svg]:w-8">
        {icon}
      </div>
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-muted-foreground text-xs">{hint}</p>
      {secondaryAction && (
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "mt-3 inline-flex items-center gap-1.5",
            "text-muted-foreground text-xs",
            "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "[&_svg]:h-4 [&_svg]:w-4",
          )}
        >
          {secondaryAction.icon}
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}

export default UploadArea;
