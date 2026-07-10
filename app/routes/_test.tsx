import { Button } from "~/components/ui/button";
import { usePricingModal } from "~/hooks/use-pricing-modal";

export default function TestPage() {
  const { openPricingModal } = usePricingModal();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Button size="lg" onClick={openPricingModal}>
        Open Pricing
      </Button>
    </main>
  );
}
