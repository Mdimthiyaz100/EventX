import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-xs font-bold uppercase tracking-[.12em] text-ink/65">
        {label}
      </span>
      <span className="flex min-h-11 items-center gap-2.5 rounded-lg border border-ink/10 bg-white/70 px-3.5 transition focus-within:border-eventx/70 focus-within:ring-2 focus-within:ring-eventx/10">
        {icon}
        <input
          className={`w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/45 ${className}`}
          id={inputId}
          {...props}
        />
      </span>
    </label>
  );
}