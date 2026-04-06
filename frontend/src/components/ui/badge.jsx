import { cn } from "../../lib/utils";
const variants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-border text-foreground",
  success: "bg-emerald-700 text-white",
  warning: "bg-amber-600 text-white",
};
export function Badge({ className, variant = "default", children, ...props }) {
  return <div className={cn("inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props}>{children}</div>;
}