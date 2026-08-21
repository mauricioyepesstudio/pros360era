import type { ReactNode } from "react";
import Container from "./Container";
import { cn } from "@/lib/cn";

type SectionProps = {
  children: ReactNode;
  className?: string;
  container?: boolean;
  id?: string;
  labelledBy?: string;
};

export default function Section({
  children,
  className = "",
  container = true,
  id,
  labelledBy,
}: SectionProps) {
  const content = container ? (
    <Container>{children}</Container>
  ) : (
    children
  );

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-20 sm:py-24", className)}
    >
      {content}
    </section>
  );
}
