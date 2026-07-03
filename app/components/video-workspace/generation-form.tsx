import {
  ChevronDown,
  Music,
  Sparkles,
  Upload,
  Video,
  WandSparkles,
} from "lucide-react";
import * as React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { SettingsPanel } from "./settings-panel";
import { UploadArea } from "./upload-area";

type GenerationTab = "multi-reference" | "image-to-video" | "text-to-video";

interface GenerationFormProps {
  activeTab?: GenerationTab;
  onTabChange?: (tab: GenerationTab) => void;
}

const TABS: { id: GenerationTab; label: string }[] = [
  { id: "multi-reference", label: "Multi Reference" },
  { id: "image-to-video", label: "Image to Video" },
  { id: "text-to-video", label: "Text to Video" },
];

const PROMPT_PLACEHOLDERS: Record<GenerationTab, string> = {
  "multi-reference":
    "Type @ to reference uploaded materials, e.g. @Image1 as first frame...",
  "image-to-video": "Prompt",
  "text-to-video": "Prompt",
};

export function GenerationForm({
  activeTab: controlledActiveTab,
  onTabChange,
}: GenerationFormProps) {
  const [internalTab, setInternalTab] =
    React.useState<GenerationTab>("multi-reference");
  const activeTab = controlledActiveTab ?? internalTab;

  const handleTabChange = (tab: GenerationTab) => {
    if (controlledActiveTab === undefined) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
  };

  const [resolution, setResolution] =
    React.useState<GenerationFormState["resolution"]>("1080p");
  const [duration, setDuration] = React.useState("5s");
  const [aspectRatio, setAspectRatio] = React.useState("Auto");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [returnLastFrame, setReturnLastFrame] = React.useState(false);

  return (
    <div
      className={cn(
        "flex h-fit shrink-0 flex-col gap-5",
        "w-full lg:w-[450px] xl:w-[500px]",
      )}
    >
      {/* Tab Bar */}
      <div
        className={cn(
          "flex w-full rounded-lg p-1",
          "border border-[rgba(40,40,40,0.5)]",
          "bg-[rgba(38,38,38,0.3)]",
        )}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5",
                "rounded-lg px-2 py-2.5 font-medium text-xs leading-4",
                "transition duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* AI Model Dropdown */}
      <button
        type="button"
        className={cn(
          "mt-2 min-h-14 w-full px-4 py-2",
          "flex items-center justify-between gap-3",
          "rounded-xl border border-[rgba(40,40,40,0.5)]",
          "bg-[rgba(10,10,10,0.5)] shadow-sm backdrop-blur-sm",
          "cursor-pointer text-[rgb(250,250,250)] text-sm",
          "transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:bg-[rgba(10,10,10,0.7)]",
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src="/seedance2-assets/seedance2-icon.png"
            alt="Seedance"
            className="h-7 w-7 object-contain"
          />
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Seedance 2.0</span>
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 font-medium text-[10px]",
                  "bg-primary/10 text-primary",
                )}
              >
                With Audio
              </span>
            </div>
            <span className="text-left text-muted-foreground text-xs">
              Multimodal input with powerful reference capabilities
            </span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "multi-reference" && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="-ml-2 w-fit rounded-md px-2 py-1 font-medium text-foreground text-sm transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Select Virtual Portrait
            </button>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Reference Images (max 9)
                </span>
                <span className="text-muted-foreground text-xs">0/9</span>
              </div>
              <UploadArea
                icon={<Upload />}
                title="Click to upload images"
                hint="png, jpg, jpeg, webp (9 remaining)"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Reference Videos (max 3, total 15s)
                </span>
                <span className="text-muted-foreground text-xs">
                  0/3 | 0.0s/15s
                </span>
              </div>
              <UploadArea
                icon={<Video />}
                title="Click to upload videos"
                hint="mp4, mov (3 remaining)"
              />
              <p className="mt-1 text-muted-foreground text-xs">Max 50MB</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Reference Audios (max 3, total 15s)
                </span>
                <span className="text-muted-foreground text-xs">
                  0/3 | 0.0s/15s
                </span>
              </div>
              <UploadArea
                icon={<Music />}
                title="Click to upload audio"
                hint="mp3, wav (3 remaining)"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={returnLastFrame}
                onCheckedChange={(checked) =>
                  setReturnLastFrame(checked === true)
                }
              />
              <span className="font-medium text-foreground text-sm">
                Return Last Frame
              </span>
            </label>
          </div>
        )}

        {activeTab === "image-to-video" && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="-ml-2 w-fit rounded-md px-2 py-1 font-medium text-foreground text-sm transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Select Virtual Portrait
            </button>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Images
                </span>
                <span className="text-muted-foreground text-xs">0/9</span>
              </div>
              <UploadArea
                icon={<Upload />}
                title="Click to upload or drag & drop"
                hint="png, jpg, jpeg, webp (9 remaining)"
                secondaryAction={{
                  label: "Generate images with AI",
                  icon: <Sparkles />,
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Add end frame
                </span>
              </div>
              <UploadArea
                icon={<Upload />}
                title="Click to upload or drag & drop"
                hint="png, jpg, jpeg, webp (remaining)"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={returnLastFrame}
                onCheckedChange={(checked) =>
                  setReturnLastFrame(checked === true)
                }
              />
              <span className="font-medium text-foreground text-sm">
                Return Last Frame
              </span>
            </label>
          </div>
        )}

        {activeTab === "text-to-video" && (
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={returnLastFrame}
                onCheckedChange={(checked) =>
                  setReturnLastFrame(checked === true)
                }
              />
              <span className="font-medium text-foreground text-sm">
                Return Last Frame
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Prompt Section */}
      <div className="flex min-h-[140px] w-full flex-1 flex-col space-y-2">
        <label className="font-medium text-[rgb(250,250,250)] text-sm">
          Prompt
        </label>
        <div
          className={cn(
            "relative mt-2 h-[150px] w-full flex-1",
            "rounded-xl border border-[rgba(40,40,40,0.5)]",
            "bg-input",
          )}
        >
          <textarea
            className={cn(
              "absolute inset-0 h-full w-full p-4",
              "resize-none bg-transparent text-base text-foreground",
              "outline-none placeholder:text-transparent",
            )}
            placeholder={PROMPT_PLACEHOLDERS[activeTab]}
            maxLength={5000}
            rows={4}
          />
          <span
            className={cn(
              "absolute top-4 left-4 text-[rgb(161,161,161)] text-base",
              "pointer-events-none select-none",
            )}
          >
            {PROMPT_PLACEHOLDERS[activeTab]}
          </span>
          <span
            className={cn(
              "absolute right-3 bottom-3 text-[rgb(161,161,161)] text-xs",
            )}
          >
            0/5000
          </span>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        resolution={resolution}
        onResolutionChange={(val) =>
          setResolution(val as GenerationFormState["resolution"])
        }
        duration={duration}
        onDurationChange={setDuration}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        advancedOpen={advancedOpen}
        onAdvancedToggle={() => setAdvancedOpen((prev) => !prev)}
      />

      {/* Generate Button */}
      <button
        type="button"
        disabled
        className={cn(
          "h-14 w-full px-4",
          "inline-flex items-center justify-center gap-2",
          "rounded-xl font-semibold text-base leading-6",
          "text-[rgb(23,23,23)]",
          "relative overflow-hidden",
          "transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "disabled:cursor-default disabled:opacity-50",
          "hover:enabled:brightness-110",
        )}
        style={{
          background:
            "linear-gradient(to right, rgb(229, 229, 229), rgb(147, 51, 234))",
          boxShadow:
            "0 10px 15px -3px rgba(229,229,229,0.2), 0 4px 6px -4px rgba(229,229,229,0.2)",
        }}
      >
        <WandSparkles className="h-3.5 w-3.5 shrink-0" />
        Generate
      </button>
    </div>
  );
}

// Internal helper type so the inline cast is self-documenting.
type GenerationFormState = {
  resolution: "480p" | "720p" | "1080p" | "4K";
};

export default GenerationForm;
