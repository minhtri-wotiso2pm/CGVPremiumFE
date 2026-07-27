import type { FC } from "react";
import { useTranslation } from "react-i18next";
import "./movies.css";

interface Props { onRetry: () => void }

const MovieErrorState: FC<Props> = ({ onRetry }) => {
    const { t } = useTranslation("movies");
    return (
        <div className="cgv-state-card" role="alert">
            <div className="cgv-state-card__icon-ring">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2 className="cgv-state-card__title">{t("error.title")}</h2>
            <p className="cgv-state-card__body">
                {t("error.body")}
            </p>
            <button className="cgv-state-card__btn cgv-state-card__btn--primary" onClick={onRetry}>
                {t("common:actions.tryAgain")}
            </button>
        </div>
    );
};

export default MovieErrorState;
