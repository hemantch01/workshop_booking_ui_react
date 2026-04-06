import { cn } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;
  return (
    <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center justify-center h-9 w-9 border border-input hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center justify-center h-9 w-9 border border-input hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}