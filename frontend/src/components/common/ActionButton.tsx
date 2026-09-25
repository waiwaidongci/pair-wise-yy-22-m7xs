import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "danger" | "ghost";
  size?: "small" | "normal";
  children: ReactNode;
}

export function ActionButton({ tone = "ghost", size = "normal", className = "", children, ...rest }: ActionButtonProps) {
  return (
    <button className={`btn ${size} ${tone} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
