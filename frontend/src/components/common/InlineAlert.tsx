import { AlertCircle, X } from "lucide-react";

interface InlineAlertProps {
  message: string;
  onDismiss?: () => void;
}

export default function InlineAlert({ message, onDismiss }: InlineAlertProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-amber-900/15 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
      <p className="flex-1 leading-6">{message}</p>
      {onDismiss && (
        <button
          aria-label="Dismiss message"
          className="rounded p-1 transition hover:bg-amber-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      )}
    </div>
  );
}
