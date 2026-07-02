import { cn } from "~/lib/utils";
import { Spinner } from "~/components/spinner";
import { Loader2 } from "lucide-react";

interface CubeLoadingProps {
  text?: string;
  className?: string;
  textClassName?: string;
}

export function CubeLoading({
  text = "Loading...",
  className,
  textClassName,
}: CubeLoadingProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading"}
    >
      <div className="model-loading-cube-container" aria-hidden="true">
        <div className="model-loading-cube">
          <div className="model-loading-cube-face model-loading-cube-front" />
          <div className="model-loading-cube-face model-loading-cube-back" />
          <div className="model-loading-cube-face model-loading-cube-right" />
          <div className="model-loading-cube-face model-loading-cube-left" />
          <div className="model-loading-cube-face model-loading-cube-top" />
          <div className="model-loading-cube-face model-loading-cube-bottom" />
        </div>
      </div>
      {text ? (
        <p
          className={cn(
            "mt-4 text-center text-sm font-medium text-[#c8f7e4]",
            textClassName,
          )}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

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
          "text-[#00d992] drop-shadow-[0_0_10px_rgba(0,217,146,0.35)]",
          sizeClasses[size],
          fullScreen && "h-12 w-12",
        )}
      />
      {text && (
        <span
          className={cn(
            "font-medium text-[#c8f7e4]",
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
          "fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/85 backdrop-blur-sm",
          overlay && "bg-[#050507]/75",
          overlayClassName,
        )}
        role="status"
        aria-live="polite"
        aria-label={text || "Loading"}
      >
        <div className="flex flex-col items-center gap-4 rounded-lg border border-[#00d992]/25 bg-[#101010]/95 p-8 shadow-[0_0_40px_rgba(0,217,146,0.14)]">
          {LoadingContent}
        </div>
      </div>
    );
  }

  return LoadingContent;
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  variant = "default",
  size = "md",
  className,
  ...props
}: LoadingButtonProps) {
  const baseButtonStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizeStyles = {
    sm: "h-9 rounded-md px-3",
    md: "h-10 rounded-md px-4 py-2",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={cn(
        baseButtonStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner
            className={cn(
              "mr-2 text-current",
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
            )}
          />
          <span>{loadingText || "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  text?: string;
}

export function LoadingOverlay({
  show,
  children,
  className,
  text,
}: LoadingOverlayProps) {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050507]/45 backdrop-blur-[1px]">
        <div className="rounded-lg border border-[#00d992]/20 bg-[#101010]/95 p-4 shadow-[0_0_32px_rgba(0,217,146,0.12)]">
          <Loading text={text} size="md" />
        </div>
      </div>
    </div>
  );
}

interface LoadingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  text?: string;
}

export function LoadingCard({
  loading = false,
  text = "Loading...",
  children,
  className,
  ...props
}: LoadingCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-[#00d992]/25 bg-[#050507]/80 p-8",
          className,
        )}
        {...props}
      >
        <Loading text={text} size="md" />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

export function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} />;
}
