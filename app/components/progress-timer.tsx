import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressTimerProps {
  maxTime: number; // seconds
  onComplete?: () => void;
  className?: string;
}

export function ProgressTimer({
  maxTime,
  onComplete,
  className,
}: ProgressTimerProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Reset state when maxTime changes
    setProgress(10);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const percentage = Math.min(
        10 + (elapsed / maxTime) * 85, // 10 -> 95
        100,
      );

      setProgress(percentage);

      if (elapsed >= maxTime) {
        clearInterval(interval);
        setProgress(100);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [maxTime, onComplete]);

  return (
    <div className={className}>
      <div className="relative h-6 overflow-hidden rounded-full bg-muted shadow-sm">
        <Progress
          value={progress}
          className="h-full border-none bg-transparent"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-semibold text-primary-foreground text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
