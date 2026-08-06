import { ReactNode } from "react";
import Container from "./Container";

type SectionProps = {
  children: ReactNode;
  className?: string;
  container?: boolean;
  id?: string;
};

export default function Section({
  children,
  className = "",
  container = true,
  id,
}: SectionProps) {
  const content = container ? (
    <Container>{children}</Container>
  ) : (
    children
  );

  return (
    <section
      id={id}
      className={`py-24 ${className}`}
    >
      {content}
    </section>
  );
}