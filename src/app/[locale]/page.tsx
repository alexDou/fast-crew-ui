import { ComingSoonCard, OverviewCard, PoetsCrewCard } from "@/widgets";

export default function Home() {
  return (
    <div className="mesh-gradient min-h-screen">
      {/* Ambient floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/4 size-96 rounded-full bg-bento-teal-from/10 blur-[120px] animate-float-slow"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-bento-beige-accent/10 blur-[100px] animate-float-slow"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-6 lg:flex-row lg:p-8 z-10">
        {/* Left column — 40% */}
        <div className="flex flex-col gap-5 lg:w-2/5 animate-entrance-left">
          <OverviewCard />
        </div>

        {/* Right column — 60% */}
        <div className="flex flex-col gap-5 lg:w-3/5 animate-entrance-right">
          <PoetsCrewCard />
          <ComingSoonCard />
        </div>
      </div>
    </div>
  );
}
