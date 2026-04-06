import { useState } from "react";
import { cn } from "../../lib/utils";
export function Tabs({ tabs, defaultTab, className }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value);
  const current = tabs.find(t => t.value === active);
  return (
    <div className={cn("w-full", className)}>
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setActive(t.value)}
            className={cn("px-4 py-2 text-sm font-medium transition-colors cursor-pointer -mb-px",
              active === t.value ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>{t.label}</button>
        ))}
      </div>
      <div className="pt-4">{current?.content}</div>
    </div>
  );
}