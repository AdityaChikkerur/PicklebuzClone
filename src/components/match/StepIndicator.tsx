import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { MatchSetupState } from "@/types/match";

const STEPS: { step: MatchSetupState["step"]; label: string }[] = [
  { step: 1, label: "Type" },
  { step: 2, label: "Players" },
  { step: 3, label: "Venue" },
  { step: 4, label: "Scoring" },
];

interface StepIndicatorProps {
  currentStep: MatchSetupState["step"];
  onBack?: () => void;
}

export function StepIndicator({ currentStep, onBack }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {currentStep > 1 && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go to previous step"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-1 items-center gap-2">
        {STEPS.map(({ step, label }) => (
          <div key={step} className="flex flex-1 flex-col gap-1">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                currentStep >= step ? "bg-primary" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                currentStep >= step ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
