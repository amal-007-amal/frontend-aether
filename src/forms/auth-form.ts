import { z } from "zod";

export const authFormSchema = z.object({
  serverUrl: z.string().url({ message: "Invalid server URL" }),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(6, "Minimum 6 characters"),
  otp: z.string().regex(/^\d{4,6}$/, "OTP must be 4–6 digits").optional(),
  refId: z.string().optional()
});

export type AuthFormType = z.infer<typeof authFormSchema>;