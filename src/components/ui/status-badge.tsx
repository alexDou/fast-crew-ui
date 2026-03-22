import * as React from "react";

import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.ComponentProps<"span"> {
  pulse?: boolean;
}

function StatusBadge({ className, pulse, children, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-[11px] uppercase tracking-[1.5px]",
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export { StatusBadge };
