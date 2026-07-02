import { cn } from "~/lib/utils";
import { RichText } from "../rich-text";

export function LandingSectionHeading({
  title,
  description,
  align = "center",
  className,
}: {
  title?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  if (!title && !description) {
    return null;
  }

  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col gap-4",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {title ? (
        <h2 className="font-display font-normal text-3xl text-[#f2f2f2] leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-5xl">
          <RichText text={title} />
        </h2>
      ) : null}
      {description ? (
        <p className="text-balance text-[#b8b3b0] text-base leading-7 sm:text-lg">
          <RichText text={description} />
        </p>
      ) : null}
    </div>
  );
}
