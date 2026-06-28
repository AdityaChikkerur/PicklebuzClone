import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

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
