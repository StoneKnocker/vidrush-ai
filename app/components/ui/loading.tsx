import type * as React from "react";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  textClassName?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  overlayClassName?: string;
}

export function Loading({
  size = "md",
  text,
  className,
  textClassName,
  fullScreen = false,
  overlay = true,
  overlayClassName,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const LoadingContent = (
    <div
      className={cn(
        "flex items-center gap-2",
        !text && "justify-center",
        fullScreen && "flex-col",
        className,
      )}
    >
      <Spinner
        className={cn(
          "text-primary drop-shadow-[0_0_10px_rgba(0,217,146,0.35)]",
          sizeClasses[size],
          fullScreen && "h-12 w-12",
        )}
      />
      {text && (
        <span
          className={cn(
            "font-medium text-primary",
            textSizeClasses[size],
            textClassName,
          )}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm",
          overlay && "bg-background/75",
          overlayClassName,
        )}
        role="status"
        aria-live="polite"
        aria-label={text || "Loading"}
      >
        <div className="flex flex-col items-center gap-4 rounded-lg border border-primary/25 bg-card/95 p-8 shadow-[0_0_40px_rgba(0,217,146,0.14)]">
          {LoadingContent}
        </div>
      </div>
    );
  }

  return LoadingContent;
}

type LoadingButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "asChild"
> & {
  loading?: boolean;
  loadingText?: string;
};

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  size = "lg",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      size={size}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Spinner
            className={cn("text-current", size === "sm" ? "size-3" : "size-4")}
          />
          <span>{loadingText || "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
