import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie")
  .regex(/[A-Z]/, "Legalább egy nagybetűt tartalmazzon")
  .regex(/[a-z]/, "Legalább egy kisbetűt tartalmazzon")
  .regex(/[0-9]/, "Legalább egy számjegyet tartalmazzon");

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Add meg a teljes neved"),
    email: z.string().email("Érvényes e-mail címet adj meg"),
    password: passwordRule,
    confirmPassword: z.string(),
    phone: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A két jelszó nem egyezik",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Hibás e-mail"),
  password: z.string().min(1, "Add meg a jelszavad"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  zipCode: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Add meg a jelenlegi jelszavad"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "A két jelszó nem egyezik",
    path: ["confirmPassword"],
  });

export const cardControlsSchema = z.object({
  onlinePurchase: z.boolean().optional(),
  contactless: z.boolean().optional(),
  atmWithdrawal: z.boolean().optional(),
});

export const adminBalanceUpdateSchema = z.object({
  amount: z.number().int(),
  description: z.string().min(3),
  senderName: z.string().optional(),
  senderAccountNumber: z.string().optional(),
});
