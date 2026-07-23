import { Balancer } from "react-wrap-balancer";

type HeroType = {
  title: React.ReactNode;
  description: React.ReactNode;
};

export function Hero({ title, description }: HeroType) {
  return (
    <div className="mt-20 flex flex-col items-center justify-center gap-6">
      <Balancer
        as="h1"
        className="text-center font-bold text-2xl text-black lg:text-5xl dark:text-white"
      >
        {title}
      </Balancer>

      <Balancer as="div">
        <p className="max-w-3xl px-3 text-center text-base">{description}</p>
      </Balancer>
    </div>
  );
}
