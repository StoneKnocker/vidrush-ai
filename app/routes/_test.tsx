import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  CubeLoading,
  Loading,
  LoadingButton,
  LoadingCard,
  LoadingDots,
  LoadingOverlay,
  LoadingSpinner,
} from "~/components/ui/loading";

function PreviewPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#3d3a39] bg-[#101010]/86 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-5">
        <h2 className="font-semibold text-[#f2f2f2] text-lg">{title}</h2>
        <p className="mt-1 text-[#b8b3b0] text-sm">{description}</p>
      </div>
      <div className="min-h-32 rounded-lg border border-[#3d3a39]/70 bg-[#050507]/80 p-5">
        {children}
      </div>
    </section>
  );
}

export default function TestPage() {
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleShowFullScreen = () => {
    setShowFullScreen(true);
    window.setTimeout(() => setShowFullScreen(false), 1800);
  };

  return (
    <main className="landing-theme min-h-screen bg-[#050507] text-[#f2f2f2]">
      {showFullScreen ? (
        <Loading fullScreen text="Connecting avatar session..." />
      ) : null}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="font-medium text-[#00d992] text-xs uppercase tracking-[0.24em]">
            Loading states
          </p>
          <h1 className="mt-3 font-semibold text-3xl tracking-tight sm:text-4xl">
            Avatar workflow loading checks
          </h1>
          <p className="mt-4 max-w-2xl text-[#b8b3b0]">
            Review the shared loading components against the dark creator
            workspace theme before using them in auth, preview, upload, and
            generation flows.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <PreviewPanel
            title="Inline loading"
            description="Small, medium, and large states for header and compact UI."
          >
            <div className="flex flex-wrap items-center gap-6">
              <Loading size="sm" text="Syncing" />
              <Loading size="md" text="Preparing" />
              <Loading size="lg" text="Generating" />
              <Loading size="md" />
            </div>
          </PreviewPanel>

          <PreviewPanel
            title="Button loading"
            description="Checkout, generation, and auth actions while requests are pending."
          >
            <div className="flex flex-wrap items-center gap-3">
              <LoadingButton loading loadingText="Submitting prompt">
                Submit
              </LoadingButton>
              <LoadingButton
                loading
                loadingText="Checking export"
                variant="outline"
              >
                Export
              </LoadingButton>
              <LoadingButton loading loadingText="Retrying" variant="secondary">
                Retry
              </LoadingButton>
            </div>
          </PreviewPanel>

          <PreviewPanel
            title="Overlay loading"
            description="Local blocking state when a panel keeps its surrounding context."
          >
            <LoadingOverlay show text="Uploading reference">
              <div className="grid gap-3">
                <div className="h-4 w-40 rounded bg-[#3d3a39]" />
                <div className="h-24 rounded border border-[#3d3a39] bg-[#101010]" />
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded bg-[#3d3a39]" />
                  <div className="h-8 w-28 rounded bg-[#3d3a39]" />
                </div>
              </div>
            </LoadingOverlay>
          </PreviewPanel>

          <PreviewPanel
            title="Loading card"
            description="Empty content zones while data or assets are unavailable."
          >
            <LoadingCard loading text="Fetching avatar metadata" />
          </PreviewPanel>

          <PreviewPanel
            title="3D cube loading"
            description="Preview-oriented loading state for model and asset rendering."
          >
            <div className="flex min-h-44 items-center justify-center">
              <CubeLoading text="Loading 3D preview..." />
            </div>
          </PreviewPanel>

          <PreviewPanel
            title="Utility indicators"
            description="Tiny indicators for command bars, rows, and streaming copy."
          >
            <div className="flex flex-col gap-5 text-[#c8f7e4]">
              <div className="flex items-center gap-3">
                <LoadingSpinner className="size-5 text-[#00d992]" />
                <span>Retopology pass running</span>
              </div>
              <div>
                Saving avatar draft
                <LoadingDots />
              </div>
              <Button
                className="w-fit border border-[#00d992]/60 bg-[#101010] text-[#2fd6a1] hover:bg-black/20 hover:text-[#00d992]"
                onClick={handleShowFullScreen}
              >
                Show full-screen loading
              </Button>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </main>
  );
}
