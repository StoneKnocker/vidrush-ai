import * as React from "react";
import { cn } from "~/lib/utils";
import { GenerationForm } from "./generation-form";
import { VideoPreview } from "./video-preview";

type GenerationTab = "multi-reference" | "image-to-video" | "text-to-video";

export type VideoWorkspaceProps = {};

export function VideoWorkspace(_props: VideoWorkspaceProps) {
  const [activeTab, setActiveTab] =
    React.useState<GenerationTab>("multi-reference");

  return (
    <div
      className={cn(
        "landing-theme mx-auto my-4 flex h-full w-full max-w-[90rem] flex-col items-start gap-8 p-6 lg:flex-row",
        "rounded-3xl border border-border/50 bg-card shadow-xl",
      )}
    >
      <GenerationForm activeTab={activeTab} onTabChange={setActiveTab} />
      <VideoPreview showGuide={activeTab === "multi-reference"} />
    </div>
  );
}

export default VideoWorkspace;
