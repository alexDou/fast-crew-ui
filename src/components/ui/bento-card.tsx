import * as React from "react";

import { cn } from "@/lib/utils";

function BentoCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-card"
      className={cn("relative overflow-hidden border border-border", className)}
      {...props}
    />
  );
}

export { BentoCard };
