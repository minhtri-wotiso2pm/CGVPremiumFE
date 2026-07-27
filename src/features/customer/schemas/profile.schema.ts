import { z } from "zod";
export const updateProfileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters.").max(80, "Must not exceed 80 characters."),
    phone: z.string().regex(/^(0[3|5|7|8|9])\d{8}$/, "Invalid Vietnamese phone number."),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;