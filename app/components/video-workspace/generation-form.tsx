import {
  FileText,
  Image,
  Info,
  Layers,
  Music,
  Sparkles,
  Type,
  Upload,
  UserRound,
  Video,
  WandSparkles,
} from "lucide-react";
import * as React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import type { PortraitItem } from "./portrait-library";
import { PortraitLibrary } from "./portrait-library";
import { SettingsPanel } from "./settings-panel";
import { UploadArea } from "./upload-area";

type GenerationTab = "multi-reference" | "image-to-video" | "text-to-video";

interface GenerationFormProps {
  activeTab?: GenerationTab;
  onTabChange?: (tab: GenerationTab) => void;
}

const TABS: { id: GenerationTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "multi-reference",
    label: "Multi Reference",
    icon: <WandSparkles className="h-3.5 w-3.5 shrink-0" />,
  },
  {
    id: "image-to-video",
    label: "Image to Video",
    icon: <Image className="h-3.5 w-3.5 shrink-0" />,
  },
  {
    id: "text-to-video",
    label: "Text to Video",
    icon: <Type className="h-3.5 w-3.5 shrink-0" />,
  },
];

const PROMPT_PLACEHOLDERS: Record<GenerationTab, string> = {
  "multi-reference":
    "Type @ to reference uploaded materials, e.g. @Image1 as first frame...",
  "image-to-video": "Describe how you want your image to animate...",
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
  const [duration, setDuration] = React.useState(5);
  const [aspectRatio, setAspectRatio] = React.useState("Auto");
  const [returnLastFrame, setReturnLastFrame] = React.useState(false);
  const [addEndFrame, setAddEndFrame] = React.useState(false);
  const [portraitLibraryOpen, setPortraitLibraryOpen] = React.useState(false);
  const [selectedPortrait, setSelectedPortrait] =
    React.useState<PortraitItem | null>(null);

  const showVirtualPortrait =
    activeTab === "multi-reference" || activeTab === "image-to-video";

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
          "flex w-full rounded-lg border-border/50 bg-muted/30 p-1",
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
                "rounded-md px-2 py-2.5 font-medium text-xs leading-4",
                "transition duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {tab.icon}
              <span className="min-w-0 text-center leading-tight [overflow-wrap:anywhere]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Model Dropdown */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <Layers className="h-4 w-4" />
          AI Model
        </label>
        <Select defaultValue="seedance2">
          <SelectTrigger
            className={cn(
              "flex h-auto min-h-14 w-full items-center justify-between",
              "overflow-hidden rounded-xl border-border/50 px-4 py-2",
              "bg-background/50 text-sm shadow-sm ring-offset-background backdrop-blur-sm",
              "transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "hover:bg-background/70 focus-visible:ring-1 focus-visible:ring-primary/20",
              "[&>span]:line-clamp-none [&>span]:min-w-0 [&>span]:overflow-hidden",
            )}
          >
            <SelectValue placeholder="Select a model">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/seedance2-assets/seedance2-icon.png"
                  alt="Seedance"
                  className="h-7 w-7 object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <div className="flex w-full min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate font-semibold text-foreground">
                      Seedance 2.0
                    </span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                        "bg-primary/60 text-foreground",
                      )}
                    >
                      With Audio
                    </span>
                  </div>
                  <span className="w-full min-w-0 truncate text-left text-[10px] text-muted-foreground leading-none">
                    Multimodal input with powerful reference capabilities
                  </span>
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            position="popper"
            className={cn(
              "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]",
              "[&_[data-slot=select-item]]:focus:bg-primary/10",
              "[&_svg]:text-primary",
            )}
          >
            <SelectItem value="seedance2">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/seedance2-assets/seedance2-icon.png"
                  alt="Seedance"
                  className="h-7 w-7 object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <div className="flex w-full min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate font-semibold text-foreground">
                      Seedance 2.0
                    </span>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-primary/20 px-1.5 py-0.5 font-medium text-[10px] text-foreground">
                      With Audio
                    </span>
                  </div>
                  <span className="w-full min-w-0 truncate text-left text-[10px] text-muted-foreground leading-none">
                    Multimodal input with powerful reference capabilities
                  </span>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="seedance2-fast">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/seedance2-assets/seedance2-icon.png"
                  alt="Seedance"
                  className="h-7 w-7 object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <div className="flex w-full min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate font-semibold text-foreground">
                      Seedance 2.0 Fast
                    </span>
                  </div>
                  <span className="w-full min-w-0 truncate text-left text-[10px] text-muted-foreground leading-none">
                    Faster generation with lower cost
                  </span>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Select Virtual Portrait */}
      <PortraitLibrary
        open={portraitLibraryOpen}
        onOpenChange={setPortraitLibraryOpen}
        onSelect={(item) => setSelectedPortrait(item)}
      />

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "multi-reference" && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Image className="h-4 w-4" />
                  Reference Images (max 9)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">0 / 9</span>
                  {showVirtualPortrait && (
                    <button
                      type="button"
                      onClick={() => setPortraitLibraryOpen(true)}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "h-8 rounded-md px-2 text-xs",
                        "bg-primary/10 text-primary",
                        "transition-colors hover:bg-primary/15",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      {selectedPortrait
                        ? `${selectedPortrait.country}`
                        : "Select Virtual Portrait"}
                    </button>
                  )}
                </div>
              </div>
              <UploadArea
                icon={<Upload className="h-6 w-6 text-primary" />}
                title="Click to upload images"
                hint="png, jpg, jpeg, webp (9 remaining)"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Video className="h-4 w-4" />
                  Reference Videos (max 3, total 15s)
                </span>
                <span className="text-muted-foreground text-xs">
                  0 / 3 | 0.0s / 15s
                </span>
              </div>
              <UploadArea
                icon={<Upload className="h-6 w-6 text-primary" />}
                title="Click to upload videos"
                hint="mp4, mov (3 remaining)"
              />
              <p className="mt-1 text-muted-foreground text-xs">Max 50MB</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Music className="h-4 w-4" />
                  Reference Audios (max 3, total 15s)
                </span>
                <span className="text-muted-foreground text-xs">
                  0 / 3 | 0.0s / 15s
                </span>
              </div>
              <UploadArea
                icon={<Upload className="h-6 w-6 text-primary" />}
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
            <div className="flex items-center justify-between rounded-lg border-border/60 bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="font-medium text-sm">
                  How Image to Video Works
                </span>
              </div>
              <Info className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-white" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Image className="h-4 w-4" />
                  Images
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap text-muted-foreground text-xs">
                      Add end frame
                    </span>
                    <Switch
                      checked={addEndFrame}
                      onCheckedChange={setAddEndFrame}
                      className="scale-75"
                    />
                  </div>
                  {showVirtualPortrait && (
                    <button
                      type="button"
                      onClick={() => setPortraitLibraryOpen(true)}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "h-8 rounded-md px-2 text-xs",
                        "bg-primary/10 text-primary",
                        "transition-colors hover:bg-primary/15",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      {selectedPortrait
                        ? `${selectedPortrait.country}`
                        : "Select Virtual Portrait"}
                    </button>
                  )}
                </div>
              </div>
              <UploadArea
                icon={<Upload className="h-6 w-6 text-primary" />}
                title="Click to upload or drag & drop"
                hint="png, jpg, jpeg, webp (9 remaining)"
                secondaryAction={{
                  label: "Generate images with AI",
                  icon: <Sparkles className="h-3 w-3" />,
                }}
              />
            </div>

            {addEndFrame && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">
                    Add end frame
                  </span>
                </div>
                <UploadArea
                  icon={<Upload className="h-6 w-6 text-primary" />}
                  title="Click to upload or drag & drop"
                  hint="png, jpg, jpeg, webp (remaining)"
                />
              </div>
            )}

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
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <FileText className="h-4 w-4" />
          Prompt
        </label>
        <div className="relative flex-1">
          <textarea
            className={cn(
              "flex h-full min-h-[150px] w-full resize-none rounded-xl border p-4",
              "border-border/50 bg-background/50 shadow-sm backdrop-blur-sm",
              "text-base text-foreground md:text-sm",
              "placeholder:text-muted-foreground",
              "transition-all",
              "focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20",
              "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder={PROMPT_PLACEHOLDERS[activeTab]}
            maxLength={5000}
            rows={4}
          />
          <div className="absolute right-3 bottom-3 rounded-full border-border/50 bg-background/80 px-2 py-0.5 font-mono text-muted-foreground text-xs">
            <span>0/5000</span>
          </div>
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
      />

      {/* Generate Button */}
      <button
        type="button"
        disabled
        className={cn(
          "group relative inline-flex h-14 w-full items-center justify-center gap-2",
          "overflow-hidden rounded-xl px-4",
          "bg-card",
          "font-semibold text-primary text-base leading-6",
          "transition-all duration-300",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:enabled:brightness-110",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
        style={{
          boxShadow:
            "0 0 15px rgba(0, 217, 146, 0.15), 0 4px 6px -4px rgba(0, 217, 146, 0.1)",
        }}
      >
        <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-in-out group-hover:translate-y-0" />
        <span className="relative flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 fill-primary/20" />
          Generate
        </span>
      </button>
    </div>
  );
}

// Internal helper type so the inline cast is self-documenting.
type GenerationFormState = {
  resolution: "480p" | "720p" | "1080p" | "4K";
};

export default GenerationForm;
