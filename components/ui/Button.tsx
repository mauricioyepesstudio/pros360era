import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-3xl px-6 py-3 text-sm font-semibold tracking-[0.02em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A23A]/40";

  const styles = {
    primary:
      "bg-[#D4A23A] text-[#0D1B3D] shadow-[0_26px_60px_-30px_rgba(212,162,58,0.95)] hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-40px_rgba(212,162,58,0.9)]",
    secondary:
      "border border-slate-200 bg-slate-950/95 text-white hover:bg-slate-950",
    ghost:
      "text-white hover:bg-white/10",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
