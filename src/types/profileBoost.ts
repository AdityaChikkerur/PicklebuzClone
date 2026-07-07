export type ProfileBoostType = "free" | "paid";

export type ProfileBoostStatus =
  | "free"
  | "paid"
  | "expired"
  | "none";

export interface ProfileBoostState {
  active: boolean;
  status: ProfileBoostStatus;
  daysRemaining: number;
  expiresAt: string | null;
  boostType: ProfileBoostType | null;
}
