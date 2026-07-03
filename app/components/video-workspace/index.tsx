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
    <>
      <div
        className={cn(
          "seedance-workspace mx-auto my-4 flex h-full w-full max-w-[90rem] flex-col items-start gap-8 p-6 lg:flex-row",
          "rounded-3xl border border-border/50 bg-card shadow-xl",
        )}
        style={{
          ["--background" as string]: "0 0% 2%",
          ["--foreground" as string]: "0 0% 95%",
          ["--card" as string]: "0 0% 6%",
          ["--card-foreground" as string]: "0 0% 95%",
          ["--primary" as string]: "160 100% 43%",
          ["--primary-foreground" as string]: "0 0% 2%",
          ["--muted" as string]: "0 0% 12%",
          ["--muted-foreground" as string]: "212 9% 58%",
          ["--border" as string]: "15 3% 23%",
          ["--input" as string]: "15 3% 28%",
          ["--ring" as string]: "160 100% 43%",
          ["--popover" as string]: "0 0% 10%",
          ["--popover-foreground" as string]: "0 0% 95%",
          ["--accent" as string]: "0 0% 15%",
          ["--accent-foreground" as string]: "0 0% 95%",
        }}
      >
        <GenerationForm activeTab={activeTab} onTabChange={setActiveTab} />
        <VideoPreview showGuide={activeTab === "multi-reference"} />
      </div>
    </>
  );
}

export default VideoWorkspace;
