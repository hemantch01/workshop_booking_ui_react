import { cn } from "../../lib/utils";
import { X } from "lucide-react";
export function Dialog({ open, onClose, children, className }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-50 w-full max-w-lg border border-border bg-background p-6 animate-fade-in", className)}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
export function DialogTitle({ className, children }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}
export function DialogDescription({ className, children }) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)}>{children}</p>;
}