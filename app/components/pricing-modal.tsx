import { useEffect, useState } from "react";
import PricingGrid from "~/components/pricing-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { PricingPageContent } from "~/types/pricing";

interface PricingModalProps {
  contentData: PricingPageContent;
  defaultMode?: "subscription" | "credits";
  initialOpen?: boolean;
}

export default function PricingModal({
  contentData,
  defaultMode = "subscription",
  initialOpen = false,
}: PricingModalProps) {
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener("open-pricing-modal", handleOpen);
    window.addEventListener("close-pricing-modal", handleClose);

    return () => {
      window.removeEventListener("open-pricing-modal", handleOpen);
      window.removeEventListener("close-pricing-modal", handleClose);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto border-[#3d3a39] bg-[#050507] text-[#f2f2f2] shadow-[0_0_60px_rgba(0,217,146,0.14)] sm:max-w-6xl lg:max-w-7xl xl:max-w-[80vw] [&>button:hover]:text-[#00d992] [&>button]:text-[#b8b3b0]">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-[#f2f2f2]">
            {contentData.page.title}
          </DialogTitle>
          <DialogDescription className="text-[#b8b3b0]">
            {contentData.page.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <PricingGrid
            contentData={contentData}
            mode={defaultMode}
            showFreePlan={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
