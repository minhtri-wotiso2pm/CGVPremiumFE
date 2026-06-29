import { z } from "zod";
export const updateProfileSchema = z.object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự.").max(80, "Không vượt quá 80 ký tự."),
    phone: z.string().regex(/^(0[3|5|7|8|9])\d{8}$/, "Số điện thoại Việt Nam không hợp lệ."),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;