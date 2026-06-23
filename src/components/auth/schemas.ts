import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupStep1Schema = z
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

export type SignupStep1Values = z.infer<typeof signupStep1Schema>;

export const signupStep2Schema = z.object({
  role: z.enum(["player", "organizer", "referee", "club_owner", "admin"]),
  skillLevel: z.enum(["2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0+"]),
  city: z.string().min(2, "Enter your city"),
});

export type SignupStep2Values = z.infer<typeof signupStep2Schema>;
