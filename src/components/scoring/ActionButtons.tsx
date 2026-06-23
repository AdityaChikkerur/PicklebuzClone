"use client";

import { useState } from "react";
import {
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useMatchStore } from "@/store/matchStore";
import type { FaultType, Team } from "@/types/match";
import { FAULT_OPTIONS } from "./faultLabels";

interface ActionButtonsProps {
  disabled?: boolean;
}

export function ActionButtons({ disabled = false }: ActionButtonsProps) {
  const matchState = useMatchStore((s) => s.matchState);
  const history = useMatchStore((s) => s.history);
  const callSideOut = useMatchStore((s) => s.callSideOut);
  const addFault = useMatchStore((s) => s.addFault);
  const undoLastAction = useMatchStore((s) => s.undoLastAction);

  const [faultOpen, setFaultOpen] = useState(false);
  const [faultStep, setFaultStep] = useState<"type" | "team">("type");
  const [selectedFault, setSelectedFault] = useState<FaultType | null>(null);

  const isDisabled = disabled || matchState.isMatchComplete;

  const openFaultMenu = () => {
    setFaultOpen(true);
    setFaultStep("type");
    setSelectedFault(null);
  };

  const closeFaultMenu = () => {
    setFaultOpen(false);
    setFaultStep("type");
    setSelectedFault(null);
  };

  const selectFaultType = (type: FaultType) => {
    setSelectedFault(type);
    setFaultStep("team");
  };

  const commitFault = (team: Team) => {
    if (!selectedFault) return;
    addFault(team, selectedFault);
    closeFaultMenu();
  };

  return (
    <div className="relative px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isDisabled}
          onClick={callSideOut}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-40"
        >
          <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
          Side-out
        </button>

        <button
          type="button"
          disabled={history.length === 0 || isDisabled}
          onClick={undoLastAction}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-40"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" aria-hidden="true" />
          Undo
        </button>

        <button
          type="button"
          disabled={isDisabled}
          onClick={openFaultMenu}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors disabled:opacity-40",
            faultOpen
              ? "border-warning bg-warning/20 text-warning"
              : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
          )}
        >
          <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
          Fault
        </button>
      </div>

      {faultOpen && (
        <div
          className="mt-3 rounded-2xl border border-slate-600 bg-slate-800 p-3"
          role="dialog"
          aria-label="Record fault"
        >
          {faultStep === "type" ? (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Fault type
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FAULT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectFaultType(value)}
                    className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:border-warning hover:bg-slate-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Which team committed the fault?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => commitFault("A")}
                  className="rounded-xl border border-slate-600 bg-slate-900 py-2.5 text-sm font-semibold text-primary hover:bg-slate-700"
                >
                  {matchState.teamAName}
                </button>
                <button
                  type="button"
                  onClick={() => commitFault("B")}
                  className="rounded-xl border border-slate-600 bg-slate-900 py-2.5 text-sm font-semibold text-secondary hover:bg-slate-700"
                >
                  {matchState.teamBName}
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={closeFaultMenu}
            className="mt-2 w-full py-1.5 text-xs text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
