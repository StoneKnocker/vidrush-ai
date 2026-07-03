import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { LandingButton } from "~/types/landingpage";
import { Link } from "../i18n-link";
import { LandingIcon } from "./landing-icons";

function ActionIcon({
  icon,
  target,
}: {
  icon?: LandingButton["icon"];
  target?: LandingButton["target"];
}) {
  if (icon) {
    return <LandingIcon name={icon} />;
  }

  if (target === "_blank") {
    return <ArrowUpRight data-icon="inline-end" />;
  }

  return <ArrowRight data-icon="inline-end" />;
}

function resolveButtonClasses(variant?: LandingButton["variant"]) {
  if (variant === "secondary") {
    return {
      buttonVariant: "outline" as const,
      className:
        "border-border bg-card text-foreground hover:border-primary/70 hover:bg-black/20 hover:text-white",
    };
  }

  if (variant === "ghost") {
    return {
      buttonVariant: "ghost" as const,
      className: "text-muted-foreground hover:bg-card hover:text-foreground",
    };
  }

  if (variant === "link") {
    return {
      buttonVariant: "link" as const,
      className:
        "h-auto rounded-none px-0 py-0 font-medium text-muted-foreground no-underline hover:text-primary hover:no-underline",
    };
  }

  return {
    buttonVariant: "default" as const,
    className:
      "border border-primary/60 bg-card text-primary shadow-[0_0_20px_rgba(0,217,146,0.12)] hover:bg-black/20 hover:text-primary hover:shadow-[0_0_28px_rgba(0,217,146,0.22)]",
  };
}

export function LandingActionButton({
  button,
  onShowWorkspace,
  className,
}: {
  button: LandingButton;
  onShowWorkspace?: () => void;
  className?: string;
}) {
  const { buttonVariant, className: variantClassName } = resolveButtonClasses(
    button.variant,
  );
  const sharedClassName = cn(
    "h-12 rounded-md px-6 font-semibold text-sm transition-all duration-300 focus-visible:ring-primary/50",
    variantClassName,
    className,
  );

  if (button.action === "showWorkspace") {
    return (
      <Button
        type="button"
        variant={buttonVariant}
        className={sharedClassName}
        onClick={onShowWorkspace}
      >
        <span>{button.label}</span>
        <ActionIcon icon={button.icon} target={button.target} />
      </Button>
    );
  }

  if (button.to) {
    return (
      <Button asChild variant={buttonVariant} className={sharedClassName}>
        <Link to={button.to}>
          <span>{button.label}</span>
          <ActionIcon icon={button.icon} target={button.target} />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant={buttonVariant} className={sharedClassName}>
      <a href={button.href} target={button.target} rel="noreferrer">
        <span>{button.label}</span>
        <ActionIcon icon={button.icon} target={button.target} />
      </a>
    </Button>
  );
}

export function LandingActionRow({
  buttons,
  onShowWorkspace,
  className,
  buttonClassName,
}: {
  buttons: LandingButton[];
  onShowWorkspace?: () => void;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {buttons.map((button) => (
        <LandingActionButton
          key={`${button.label}-${button.to ?? button.href ?? button.action ?? "cta"}`}
          button={button}
          onShowWorkspace={onShowWorkspace}
          className={buttonClassName}
        />
      ))}
    </div>
  );
}
