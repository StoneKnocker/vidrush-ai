import { Button } from "~/components/ui/button";

export function SeedanceCTA() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM24 34c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM12 34c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-5xl">
            Ready to Experience Multi-Modal AI Video Creation?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Join thousands of creators who are already transforming their ideas
            into stunning videos with Seedance 2.0.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button className="rounded-full bg-card px-8 py-4 font-semibold text-primary hover:bg-card/80 hover:text-primary">
              Start Creating Free
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-border bg-transparent px-8 py-4 font-semibold text-foreground hover:bg-muted/30"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
