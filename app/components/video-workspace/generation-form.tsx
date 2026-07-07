import {
  FileText,
  Image,
  Layers,
  Loader2,
  Music,
  Sparkles,
  Type,
  Upload,
  UserRound,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import * as React from "react";
import { Switch } from "~/components/ui/switch";
import { useAuth } from "~/hooks/use-auth";
import { useLoginModal } from "~/hooks/use-login-modal";
import { usePricingModal } from "~/hooks/use-pricing-modal";
import {
  addPortraitAsset as addPortraitAssetToState,
  removeAssetById,
  type MediaKind,
  type UploadedAsset,
} from "./asset-state";
import { getTrpcErrorMessage } from "~/lib/trpc/error";
import { trpc } from "~/lib/trpc/trpc-provider";
import { generateUploadFilePath, uploadToR2 } from "~/lib/r2/r2.client";
import { cn } from "~/lib/utils";
import type { PortraitItem } from "./portrait-library";
import { PortraitLibrary } from "./portrait-library";
import { SettingsPanel } from "./settings-panel";
import type { GenerationTab, WorkspaceTaskState } from "./workspace-types";

type Resolution = "480p" | "720p" | "1080p" | "4K";
type ApiResolution = "480p" | "720p" | "1080p" | "4k";
type ApiAspectRatio =
  | "adaptive"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "21:9"
  | "1:1";

interface GenerationFormProps {
  activeTab?: GenerationTab;
  onTabChange?: (tab: GenerationTab) => void;
  onTaskStateChange?: (state: WorkspaceTaskState) => void;
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
  "multi-reference": "Describe how the references should move together...",
  "image-to-video": "Describe how you want your image to animate...",
  "text-to-video": "Describe the video you want to generate...",
};

const ASSET_LIMITS = {
  image: { maxFiles: 9, maxSize: 30 * 1024 * 1024, accept: "image/*" },
  video: { maxFiles: 3, maxSize: 50 * 1024 * 1024, accept: "video/*" },
  audio: { maxFiles: 3, maxSize: 15 * 1024 * 1024, accept: "audio/*" },
} as const;

function toApiResolution(resolution: Resolution): ApiResolution {
  return resolution === "4K" ? "4k" : resolution;
}

function toApiAspectRatio(aspectRatio: string): ApiAspectRatio {
  if (aspectRatio === "Auto") return "adaptive";
  return aspectRatio as ApiAspectRatio;
}

function getSuccessfulUrls(assets: UploadedAsset[], kind: MediaKind) {
  return assets
    .filter((asset) => asset.kind === kind && asset.status === "success")
    .map((asset) => asset.url);
}

function getResultUrls(resultData: unknown) {
  if (!resultData || typeof resultData !== "object") {
    return { videos: [], images: [] };
  }

  const data = resultData as { videos?: unknown; images?: unknown };
  return {
    videos: Array.isArray(data.videos)
      ? data.videos.filter((url): url is string => typeof url === "string")
      : [],
    images: Array.isArray(data.images)
      ? data.images.filter((url): url is string => typeof url === "string")
      : [],
  };
}

export function GenerationForm({
  activeTab: controlledActiveTab,
  onTabChange,
  onTaskStateChange,
}: GenerationFormProps) {
  const [internalTab, setInternalTab] =
    React.useState<GenerationTab>("multi-reference");
  const activeTab = controlledActiveTab ?? internalTab;
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { openPricingModal } = usePricingModal();
  const utils = trpc.useUtils();

  const [prompt, setPrompt] = React.useState("");
  const [resolution, setResolution] = React.useState<Resolution>("1080p");
  const [duration, setDuration] = React.useState(5);
  const [aspectRatio, setAspectRatio] = React.useState("Auto");
  const [generateAudio, setGenerateAudio] = React.useState(true);
  const [addEndFrame, setAddEndFrame] = React.useState(false);
  const [assets, setAssets] = React.useState<UploadedAsset[]>([]);
  const [formError, setFormError] = React.useState("");
  const [currentTaskId, setCurrentTaskId] = React.useState<string | null>(null);
  const [portraitLibraryOpen, setPortraitLibraryOpen] = React.useState(false);
  const [selectedPortrait, setSelectedPortrait] =
    React.useState<PortraitItem | null>(null);

  const getPresignedUrlMutation = trpc.r2.getPresignedUrl.useMutation();
  const creditsQuery = trpc.user.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createTaskMutation = trpc.video.createSeedanceTask.useMutation();
  const taskStatusQuery = trpc.video.getTaskStatus.useQuery(
    { taskId: currentTaskId ?? "" },
    {
      enabled: Boolean(currentTaskId),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === "completed" || status === "failed" ? false : 5000;
      },
    },
  );

  const creditCostQuery = trpc.video.getCreditsForSettings.useQuery(
    {
      resolution: toApiResolution(resolution),
      generateAudio,
    },
    { enabled: isAuthenticated },
  );

  React.useEffect(() => {
    const data = taskStatusQuery.data;
    if (!data) return;

    const urls = getResultUrls(data.resultData);
    onTaskStateChange?.({
      taskId: data.taskId,
      status:
        data.status === "completed"
          ? "completed"
          : data.status === "failed"
            ? "failed"
            : data.status === "pending"
              ? "pending"
              : "processing",
      videoUrls: urls.videos,
      imageUrls: urls.images,
      errorMessage: data.errorMessage,
    });

    if (data.status === "completed" || data.status === "failed") {
      utils.user.getCredits.invalidate();
    }
  }, [taskStatusQuery.data, onTaskStateChange, utils.user.getCredits]);

  const handleTabChange = (tab: GenerationTab) => {
    setFormError("");
    if (controlledActiveTab === undefined) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
  };

  const removeAsset = (id: string) => {
    setAssets((current) => {
      const result = removeAssetById({
        assets: current,
        id,
        selectedPortrait,
      });
      if (result.previewUrlToRevoke) {
        URL.revokeObjectURL(result.previewUrlToRevoke);
      }
      setSelectedPortrait(result.selectedPortrait);
      return result.assets;
    });
  };

  const uploadFiles = async (files: FileList | null, kind: MediaKind) => {
    if (!files || files.length === 0) return;
    if (!isAuthenticated || !user?.id) {
      setFormError("Sign in and click Generate to upload references.");
      return;
    }

    const limit = ASSET_LIMITS[kind];
    const existingCount = assets.filter((asset) => asset.kind === kind).length;
    const selectedFiles = Array.from(files).slice(
      0,
      Math.max(0, limit.maxFiles - existingCount),
    );

    if (selectedFiles.length !== files.length) {
      setFormError(`You can upload up to ${limit.maxFiles} ${kind} files.`);
    }

    await Promise.all(
      selectedFiles.map(async (file) => {
        if (file.size > limit.maxSize) {
          setFormError(`${file.name} is too large.`);
          return;
        }

        const id = crypto.randomUUID();
        const previewUrl =
          kind === "image" ? URL.createObjectURL(file) : undefined;
        const filePath = generateUploadFilePath(user.id, file.name);
        setAssets((current) => [
          ...current,
          {
            id,
            name: file.name,
            url: "",
            kind,
            progress: 0,
            status: "uploading",
            previewUrl,
          },
        ]);

        try {
          const { uploadUrl } = await getPresignedUrlMutation.mutateAsync({
            filePath,
            contentType: file.type || "application/octet-stream",
          });
          const url = await uploadToR2({
            filePath,
            contentType: file.type || "application/octet-stream",
            file,
            uploadUrl,
            onProgress: (progress) => {
              setAssets((current) =>
                current.map((asset) =>
                  asset.id === id
                    ? { ...asset, progress: progress.percentage }
                    : asset,
                ),
              );
            },
          });
          setAssets((current) =>
            current.map((asset) =>
              asset.id === id
                ? { ...asset, status: "success", progress: 100, url }
                : asset,
            ),
          );
        } catch (error) {
          setAssets((current) =>
            current.map((asset) =>
              asset.id === id
                ? {
                    ...asset,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : asset,
            ),
          );
        }
      }),
    );
  };

  const addPortraitAsset = (portrait: PortraitItem) => {
    setAssets((current) => {
      const result = addPortraitAssetToState({
        assets: current,
        portrait,
        selectedPortrait,
        maxImageFiles: ASSET_LIMITS.image.maxFiles,
      });
      setSelectedPortrait(result.selectedPortrait);
      if (result.error) {
        setFormError(result.error);
      }
      return result.assets;
    });
  };

  const validateAndBuildInput = () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 3) {
      throw new Error("Prompt must be at least 3 characters.");
    }

    const base = {
      prompt: trimmedPrompt,
      resolution: toApiResolution(resolution),
      aspectRatio: toApiAspectRatio(aspectRatio),
      duration,
      generateAudio,
    };

    if (activeTab === "text-to-video") {
      return { ...base, mode: "text-to-video" as const };
    }

    if (activeTab === "image-to-video") {
      const images = getSuccessfulUrls(assets, "image");
      if (!images[0]) {
        throw new Error("Upload a first frame image.");
      }
      return {
        ...base,
        mode: "image-to-video" as const,
        firstFrameUrl: images[0],
        ...(addEndFrame && images[1] ? { lastFrameUrl: images[1] } : {}),
      };
    }

    const referenceImageUrls = getSuccessfulUrls(assets, "image");
    const referenceVideoUrls = getSuccessfulUrls(assets, "video");
    const referenceAudioUrls = getSuccessfulUrls(assets, "audio");
    if (referenceImageUrls.length + referenceVideoUrls.length === 0) {
      throw new Error("Upload at least one image or video reference.");
    }

    return {
      ...base,
      mode: "multi-reference" as const,
      referenceImageUrls,
      referenceVideoUrls,
      referenceAudioUrls,
    };
  };

  const handleGenerate = async () => {
    setFormError("");
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const estimatedCost = creditCostQuery.data?.creditCost ?? 0;
    const balance = creditsQuery.data?.total ?? 0;
    if (estimatedCost > 0 && balance < estimatedCost) {
      openPricingModal();
      return;
    }

    try {
      const input = validateAndBuildInput();
      onTaskStateChange?.({
        status: "pending",
        videoUrls: [],
        imageUrls: [],
      });
      const result = await createTaskMutation.mutateAsync(input);
      setCurrentTaskId(result.taskId);
      onTaskStateChange?.({
        taskId: result.taskId,
        status: "processing",
        videoUrls: [],
        imageUrls: [],
      });
      utils.user.getCredits.invalidate();
    } catch (error) {
      const message = getTrpcErrorMessage(error, "Generation failed.");
      setFormError(message);
      onTaskStateChange?.({
        status: "failed",
        videoUrls: [],
        imageUrls: [],
        errorMessage: message,
      });
    }
  };

  const successfulUploads = assets.some((asset) => asset.status === "success");
  const isUploading = assets.some((asset) => asset.status === "uploading");
  const estimatedCost = creditCostQuery.data?.creditCost ?? null;
  const balance = creditsQuery.data?.total;

  return (
    <div
      className={cn(
        "flex h-fit shrink-0 flex-col gap-5",
        "w-full lg:w-[450px] xl:w-[500px]",
      )}
    >
      <div className="flex w-full rounded-lg border border-border/50 bg-secondary/70 p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 font-medium text-xs leading-4 transition",
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

      <div className="space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <Layers className="h-4 w-4" />
          AI Model
        </label>
        <div className="flex min-h-14 items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm shadow-sm">
          <img
            src="/seedance2-assets/seedance2-icon.png"
            alt="Seedance"
            className="h-7 w-7 object-contain"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                Seedance 2.0
              </span>
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-medium text-[10px]">
                With Audio
              </span>
            </div>
            <p className="truncate text-[10px] text-muted-foreground">
              bytedance/seedance-2
            </p>
          </div>
        </div>
      </div>

      {activeTab === "multi-reference" && (
        <div className="flex flex-col gap-4">
          <PortraitLibrary
            open={portraitLibraryOpen}
            onOpenChange={setPortraitLibraryOpen}
            onSelect={addPortraitAsset}
          />
          <UploadSlot
            assets={assets.filter((asset) => asset.kind === "image")}
            icon={<Upload className="h-6 w-6 text-primary" />}
            kind="image"
            label="Reference Images"
            limitText="max 9, 30MB each"
            secondaryAction={{
              label: selectedPortrait
                ? selectedPortrait.country
                : "Select Virtual Portrait",
              icon: <UserRound className="h-3.5 w-3.5" />,
              onClick: () => setPortraitLibraryOpen(true),
            }}
            onFilesSelected={uploadFiles}
            onRemove={removeAsset}
          />
          <UploadSlot
            assets={assets.filter((asset) => asset.kind === "video")}
            icon={<Upload className="h-6 w-6 text-primary" />}
            kind="video"
            label="Reference Videos"
            limitText="max 3, 50MB each"
            onFilesSelected={uploadFiles}
            onRemove={removeAsset}
          />
          <UploadSlot
            assets={assets.filter((asset) => asset.kind === "audio")}
            icon={<Upload className="h-6 w-6 text-primary" />}
            kind="audio"
            label="Reference Audios"
            limitText="max 3, 15MB each"
            onFilesSelected={uploadFiles}
            onRemove={removeAsset}
          />
        </div>
      )}

      {activeTab === "image-to-video" && (
        <div className="flex flex-col gap-4">
          <PortraitLibrary
            open={portraitLibraryOpen}
            onOpenChange={setPortraitLibraryOpen}
            onSelect={addPortraitAsset}
          />
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <span className="flex items-center gap-2 font-medium text-sm">
              <Image className="h-4 w-4" />
              Images
            </span>
            <label className="flex items-center gap-2 text-muted-foreground text-xs">
              End frame
              <Switch checked={addEndFrame} onCheckedChange={setAddEndFrame} />
            </label>
          </div>
          <UploadSlot
            assets={assets.filter((asset) => asset.kind === "image")}
            icon={<Upload className="h-6 w-6 text-primary" />}
            kind="image"
            label={addEndFrame ? "First and End Frame" : "First Frame"}
            limitText={addEndFrame ? "upload 1-2 images" : "upload 1 image"}
            secondaryAction={{
              label: selectedPortrait
                ? selectedPortrait.country
                : "Select Virtual Portrait",
              icon: <UserRound className="h-3.5 w-3.5" />,
              onClick: () => setPortraitLibraryOpen(true),
            }}
            onFilesSelected={uploadFiles}
            onRemove={removeAsset}
          />
        </div>
      )}

      <div className="flex min-h-[140px] w-full flex-1 flex-col space-y-2">
        <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
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
              "transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20",
            )}
            placeholder={PROMPT_PLACEHOLDERS[activeTab]}
            maxLength={20_000}
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <div className="absolute right-3 bottom-3 rounded-full border-border/50 bg-background/80 px-2 py-0.5 font-mono text-muted-foreground text-xs">
            {prompt.length}/20000
          </div>
        </div>
      </div>

      <SettingsPanel
        resolution={resolution}
        onResolutionChange={(val) => setResolution(val as Resolution)}
        duration={duration}
        onDurationChange={setDuration}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />

      <label className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Music className="h-4 w-4 text-primary" />
          Generate audio
        </span>
        <Switch checked={generateAudio} onCheckedChange={setGenerateAudio} />
      </label>

      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Estimated cost</span>
        <span className="font-semibold">
          {estimatedCost ?? "--"} credits
          {typeof balance === "number" && (
            <span className="ml-2 font-normal text-muted-foreground">
              Balance {balance}
            </span>
          )}
        </span>
      </div>

      {formError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {formError}
        </p>
      )}

      <button
        type="button"
        disabled={createTaskMutation.isPending || isUploading}
        onClick={handleGenerate}
        className={cn(
          "group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4",
          "bg-primary text-primary-foreground font-semibold text-base leading-6 transition-all duration-300",
          "disabled:pointer-events-none disabled:opacity-40 hover:enabled:brightness-110",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-in-out group-hover:translate-y-0" />
        <span className="relative flex items-center justify-center gap-2">
          {createTaskMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 fill-primary-foreground/30" />
          )}
          {createTaskMutation.isPending
            ? "Creating task"
            : isUploading
              ? "Uploading files"
              : successfulUploads || activeTab === "text-to-video"
                ? "Generate"
                : "Upload references"}
        </span>
      </button>
    </div>
  );
}

function UploadSlot({
  assets,
  icon,
  kind,
  label,
  limitText,
  onFilesSelected,
  onRemove,
  secondaryAction,
}: {
  assets: UploadedAsset[];
  icon: React.ReactNode;
  kind: MediaKind;
  label: string;
  limitText: string;
  onFilesSelected: (files: FileList | null, kind: MediaKind) => void;
  onRemove: (id: string) => void;
  secondaryAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
}) {
  const inputId = React.useId();
  const limit = ASSET_LIMITS[kind];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium text-foreground text-sm">
          {kind === "image" ? (
            <Image className="h-4 w-4" />
          ) : kind === "video" ? (
            <Video className="h-4 w-4" />
          ) : (
            <Music className="h-4 w-4" />
          )}
          {label}
        </span>
        <span className="text-muted-foreground text-xs">
          {assets.length} / {limit.maxFiles}
        </span>
      </div>
      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className={cn(
            "mt-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs",
            "bg-primary/10 text-primary transition-colors hover:bg-primary/15",
          )}
        >
          {secondaryAction.icon}
          {secondaryAction.label}
        </button>
      )}

      <label
        htmlFor={inputId}
        className={cn(
          "relative mt-2.5 flex h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-xl",
          "border-2 border-muted-foreground/25 border-dashed bg-transparent py-8",
          "transition-colors hover:border-muted-foreground/40 hover:bg-muted/50",
        )}
      >
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept={limit.accept}
          multiple
          onChange={(event) => {
            onFilesSelected(event.target.files, kind);
            event.currentTarget.value = "";
          }}
        />
        <div className="mb-3 rounded-full bg-primary/20 p-3 text-primary">
          {icon}
        </div>
        <p className="mb-1 font-medium text-foreground text-sm">
          Click to upload {kind}s
        </p>
        <p className="text-muted-foreground text-xs">{limitText}</p>
      </label>

      {assets.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2 py-2"
            >
              {asset.previewUrl ? (
                <img
                  src={asset.previewUrl}
                  alt=""
                  className="h-9 w-9 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  {kind === "video" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Music className="h-4 w-4" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">{asset.name}</p>
                <p className="text-muted-foreground text-[10px]">
                  {asset.status === "uploading"
                    ? `${asset.progress}%`
                    : asset.status}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => onRemove(asset.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenerationForm;
