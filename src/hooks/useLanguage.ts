import { useTranslation } from "react-i18next";
import type { AppLanguage } from "@/i18n";

/** Thin wrapper so components never touch i18next APIs directly. */
export function useLanguage() {
    const { i18n } = useTranslation();
    const language: AppLanguage = i18n.language.startsWith("vi") ? "vi" : "en";
    return {
        language,
        setLanguage: (lang: AppLanguage) => i18n.changeLanguage(lang),
    } as const;
}
