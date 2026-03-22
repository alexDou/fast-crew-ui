import { cn } from "@/lib/utils";

interface ContentAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div className="flex flex-1 bg-gradient-to-br from-bento-teal-from via-bento-teal-to/80 to-bento-teal-to">
      <div className={cn("flex w-full flex-1 flex-col p-8 lg:p-12", className)}>{children}</div>
    </div>
  );
}
