import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1440px] px-[clamp(1.5rem,4vw,4rem)]", className)}
    >
      {children}
    </div>
  );
}
