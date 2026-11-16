import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-eventx text-white shadow-[0_8px_20px_rgba(215,25,32,.2)] hover:bg-eventx-dark focus-visible:ring-eventx",
  secondary:
    "border border-ink/15 bg-paper text-ink hover:border-ink/35 focus-visible:ring-ink",
  ghost: "bg-transparent text-ink hover:bg-black/5 focus-visible:ring-ink",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      type={type}
      {...props}
    />
  );
}