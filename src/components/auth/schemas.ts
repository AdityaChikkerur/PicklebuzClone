import { z } from "zod";

export const onboardingSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  city: z.string().min(2, "Enter your city"),
  role: z.enum(["player", "organizer", "referee", "club_owner"]),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
