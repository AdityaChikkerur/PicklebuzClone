import type { FaultType } from "@/types/match";

export const FAULT_LABELS: Record<FaultType, string> = {
  kitchen: "Kitchen",
  service: "Service",
  double_bounce: "Double bounce",
  out_of_bounds: "Out of bounds",
};

export const FAULT_OPTIONS: { value: FaultType; label: string }[] = [
  { value: "kitchen", label: "Kitchen violation" },
  { value: "service", label: "Service fault" },
  { value: "double_bounce", label: "Double bounce" },
  { value: "out_of_bounds", label: "Out of bounds" },
];
