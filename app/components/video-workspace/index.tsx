import * as React from "react";
import { cn } from "~/lib/utils";
import { GenerationForm } from "./generation-form";
import { VideoPreview } from "./video-preview";

type GenerationTab = "multi-reference" | "image-to-video" | "text-to-video";

export interface VideoWorkspaceProps {
  // No external props for the demo clone; all data is internal/mock.
}

export function VideoWorkspace(_props: VideoWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<GenerationTab>(
    "multi-reference",
  );

  return (
    <>
      <style>{`
        .seedance-workspace [class*="text-muted-foreground"] {
          color: hsl(223.8136 0.0000% 63.0163%) !important;
        }
        .seedance-workspace [class*="text-muted-foreground"]:hover {
          color: hsl(223.8136 0.0004% 98.0256%) !important;
        }
        .seedance-workspace [class*="bg-primary"],
        .seedance-workspace [class*="bg-primary"]::before {
          background-color: hsl(223.8136 0.0001% 89.8161%) !important;
        }
        .seedance-workspace [class*="text-primary-foreground"] {
          color: hsl(223.8136 0.0000% 9.0527%) !important;
        }
      `}</style>
      <div
        className={cn(
          "seedance-workspace flex flex-col lg:flex-row items-start gap-8 my-4 h-full mx-auto p-6",
          "rounded-3xl border border-border/50 bg-card shadow-xl",
        )}
        style={{
          ["--background" as string]: "223.8136 0.0000% 3.9388%",
          ["--foreground" as string]: "223.8136 0.0004% 98.0256%",
          ["--card" as string]: "223.8136 0.0000% 9.0527%",
          ["--card-foreground" as string]: "223.8136 0.0004% 98.0256%",
          ["--primary" as string]: "223.8136 0.0001% 89.8161%",
          ["--primary-foreground" as string]: "223.8136 0.0000% 9.0527%",
          ["--muted" as string]: "223.8136 0.0000% 14.9382%",
          ["--muted-foreground" as string]: "223.8136 0.0000% 63.0163%",
          ["--border" as string]: "223.8136 0.0000% 15.5096%",
          ["--input" as string]: "223.8136 0.0000% 20.3885%",
          ["--ring" as string]: "223.8136 0.0000% 45.1519%",
          ["--color-primary" as string]: "hsl(223.8136 0.0001% 89.8161%)",
          ["--color-primary-foreground" as string]: "hsl(223.8136 0.0000% 9.0527%)",
          ["--color-muted" as string]: "hsl(223.8136 0.0000% 14.9382%)",
          ["--color-muted-foreground" as string]: "hsl(223.8136 0.0000% 63.0163%)",
          ["--color-foreground" as string]: "hsl(223.8136 0.0004% 98.0256%)",
          ["--color-card" as string]: "hsl(223.8136 0.0000% 9.0527%)",
          ["--color-border" as string]: "hsl(223.8136 0.0000% 15.5096%)",
          ["--color-input" as string]: "hsl(223.8136 0.0000% 20.3885%)",
          ["--color-ring" as string]: "hsl(223.8136 0.0000% 45.1519%)",
        }}
      >
      <GenerationForm activeTab={activeTab} onTabChange={setActiveTab} />
      <VideoPreview showGuide={activeTab === "multi-reference"} />
    </div>
    </>
  );
}

export default VideoWorkspace;
