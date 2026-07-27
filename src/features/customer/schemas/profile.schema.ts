import { z } from "zod";
import type { TFunction } from "i18next";

/* Schema factory — messages resolve through t so validation errors follow
 * the active language. Rebuild the resolver when t changes (language switch). */
export const makeUpdateProfileSchema = (t: TFunction) =>
    z.object({
        fullName: z
            .string()
            .min(2, t("profile:validation.fullNameMin"))
            .max(80, t("profile:validation.fullNameMax")),
        phone: z
            .string()
            .regex(/^(0[3|5|7|8|9])\d{8}$/, t("profile:validation.phoneInvalid")),
    });

export type UpdateProfileFormValues = z.infer<ReturnType<typeof makeUpdateProfileSchema>>;
