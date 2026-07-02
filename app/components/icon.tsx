import type { LucideIcon } from "lucide-react";
import { HelpCircle, icons } from "lucide-react";

export const Icon = ({
  name,
  color,
  size,
  className,
  ...props
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) => {
  const IconComponent = (icons[name as keyof typeof icons] ||
    HelpCircle) as LucideIcon;

  return (
    <IconComponent color={color} size={size} className={className} {...props} />
  );
};
