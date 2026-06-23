"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { RuleSection } from "./ruleContent";

interface RuleAccordionProps {
  sections: RuleSection[];
  openId: string | null;
  onToggle: (id: string) => void;
}

export function RuleAccordion({
  sections,
  openId,
  onToggle,
}: RuleAccordionProps) {
  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => {
        const isOpen = openId === section.id;

        return (
          <div key={section.id} className="card-base overflow-hidden">
            <button
              type="button"
              onClick={() => onToggle(section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
            >
              <span className="font-semibold text-foreground">{section.title}</span>
              <ChevronDownIcon
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {section.summary}
                </p>
                <div className="rounded-xl bg-muted/30 p-4">{section.diagram}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
