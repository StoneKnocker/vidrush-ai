import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

interface SettingsPanelProps {
  resolution: "480p" | "720p" | "1080p" | "4K";
  onResolutionChange: (val: string) => void;
  duration: string;
  onDurationChange: (val: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (val: string) => void;
  advancedOpen: boolean;
  onAdvancedToggle: () => void;
}

interface OptionGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  return (
    <div className="flex flex-col">
      <span className="mb-2 font-medium text-muted-foreground text-xs">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex items-center justify-center rounded-md border px-3 py-1.5 font-medium text-xs leading-4 transition-colors duration-150 ease-in-out",
                selected
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsPanel({
  resolution,
  onResolutionChange,
  duration,
  onDurationChange,
  aspectRatio,
  onAspectRatioChange,
  advancedOpen,
  onAdvancedToggle,
}: SettingsPanelProps) {
  return (
    <div className="mt-2 w-full">
      <div className="flex flex-wrap items-center gap-4">
        <OptionGroup
          label="Resolution"
          options={["480p", "720p", "1080p", "4K"]}
          value={resolution}
          onChange={onResolutionChange}
        />
        <OptionGroup
          label="Duration"
          options={["5s"]}
          value={duration}
          onChange={onDurationChange}
        />
        <OptionGroup
          label="Aspect Ratio"
          options={["Auto", "16:9", "9:16", "4:3", "3:4", "21:9", "1:1"]}
          value={aspectRatio}
          onChange={onAspectRatioChange}
        />
        <button
          type="button"
          onClick={onAdvancedToggle}
          className="flex cursor-pointer items-center gap-2 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          Advanced
          {advancedOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {advancedOpen && (
        <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between font-medium text-muted-foreground text-xs">
              <span>Quality</span>
              <span>High</span>
            </div>
            <Slider defaultValue={[75]} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between font-medium text-muted-foreground text-xs">
              <span>Motion</span>
              <span>Medium</span>
            </div>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-xs">
              Enhance
            </span>
            <button
              type="button"
              className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-primary transition-colors"
            >
              <span className="inline-block h-3.5 w-3.5 translate-x-5 rounded-full bg-primary-foreground transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
