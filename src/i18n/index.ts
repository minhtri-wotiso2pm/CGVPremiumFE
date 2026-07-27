/**
 * i18n bootstrap — i18next is the single source of truth for language.
 * Persistence, dayjs locale sync and <html lang> all live here so no
 * component ever touches localStorage or dayjs directly.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { STORAGE_KEYS } from "@/constants/storageKeys";

import enCommon from "./locales/en/common.json";
import enHeader from "./locales/en/header.json";
import enFooter from "./locales/en/footer.json";
import enProfile from "./locales/en/profile.json";
import enBooking from "./locales/en/booking.json";
import viCommon from "./locales/vi/common.json";
import viHeader from "./locales/vi/header.json";
import viFooter from "./locales/vi/footer.json";
import viProfile from "./locales/vi/profile.json";
import viBooking from "./locales/vi/booking.json";

export type AppLanguage = "en" | "vi";

const resources = {
    en: { common: enCommon, header: enHeader, footer: enFooter, profile: enProfile, booking: enBooking },
    vi: { common: viCommon, header: viHeader, footer: viFooter, profile: viProfile, booking: viBooking },
} as const;

const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
const initialLanguage: AppLanguage = stored === "vi" ? "vi" : "en";

i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});

const applyLocaleSideEffects = (lng: string) => {
    const lang: AppLanguage = lng.startsWith("vi") ? "vi" : "en";
    dayjs.locale(lang);
    document.documentElement.lang = lang;
};

i18n.on("languageChanged", (lng) => {
    const lang: AppLanguage = lng.startsWith("vi") ? "vi" : "en";
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    applyLocaleSideEffects(lang);
});

applyLocaleSideEffects(initialLanguage);

export default i18n;
