import * as React from "react";

import { cn } from "@/lib/utils";

interface MetaItemProps extends React.ComponentProps<"div"> {
  label: string;
  value: string;
  icon?: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}

function MetaItem({
  className,
  label,
  value,
  icon,
  labelClassName,
  valueClassName,
  ...props
}: MetaItemProps) {
  return (
    <div data-slot="meta-item" className={cn("flex flex-col gap-1", className)} {...props}>
      <span
        className={cn(
          "flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-[1.2px]",
          labelClassName
        )}
      >
        {icon}
        {label}
      </span>
      <span className={cn("text-sm font-medium", valueClassName)}>{value}</span>
    </div>
  );
}

export { MetaItem };
