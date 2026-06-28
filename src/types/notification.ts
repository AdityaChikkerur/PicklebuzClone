export type NotificationType =
  | "match_invite"
  | "follow"
  | "registration_approved"
  | "result_confirmation"
  | "dispute_raised"
  | "upcoming_match"
  | "court_booking";

export interface AppNotification {
  id: string;
  userId: string;
  icon: string;
  text: string;
  link: string;
  read: boolean;
  createdAt: string;
  type?: NotificationType;
}

export interface DbNotification {
  id: string;
  user_id: string;
  icon: string | null;
  text: string;
  link: string | null;
  read: boolean;
  created_at: string;
}
