/**
 * SettingsPage.tsx
 * Customer settings — vertical stack of section cards so future sections
 * (notifications, privacy, security) append naturally. First real section:
 * language switcher (EN/VI).
 */

import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import type { AppLanguage } from "@/i18n";
import styles from "./SettingsPage.module.css";

/* Language display names stay in their own language — never translated. */
const LANGUAGE_OPTIONS: ReadonlyArray<{
    value: AppLanguage;
    name: string;
    native: string;
}> = [
    { value: "en", name: "English", native: "English (US)" },
    { value: "vi", name: "Tiếng Việt", native: "Vietnamese" },
];

const CheckIcon: FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const SettingsPage: FC = () => {
    const { t } = useTranslation("profile");
    const { language, setLanguage } = useLanguage();

    return (
        <div className={styles.stack}>
            <section className={styles.card} aria-labelledby="settings-language-label">
                <h2 id="settings-language-label" className={styles.sectionLabel}>
                    {t("settings.language.label")}
                </h2>
                <p className={styles.sectionDesc}>{t("settings.language.description")}</p>

                <div className={styles.langOptions} role="radiogroup" aria-label={t("settings.language.label")}>
                    {LANGUAGE_OPTIONS.map((option) => {
                        const active = language === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                className={
                                    active
                                        ? `${styles.langOption} ${styles.langOptionActive}`
                                        : styles.langOption
                                }
                                onClick={() => setLanguage(option.value)}
                            >
                                <span>
                                    <span className={styles.langName}>{option.name}</span>
                                    <span className={styles.langNative}>{option.native}</span>
                                </span>
                                <span
                                    className={
                                        active
                                            ? styles.langCheck
                                            : `${styles.langCheck} ${styles.langCheckIdle}`
                                    }
                                    aria-hidden="true"
                                >
                                    {active && <CheckIcon />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
