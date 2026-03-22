import { ComingSoonCard, OverviewCard, PoetsCrewCard } from "@/widgets";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-6 lg:flex-row lg:p-8">
      {/* Left column — 40% */}
      <div className="flex flex-col gap-5 lg:w-2/5">
        <OverviewCard />
        <ComingSoonCard />
      </div>

      {/* Right column — 60% */}
      <div className="flex flex-col lg:w-3/5">
        <PoetsCrewCard />
      </div>
    </div>
  );
}
