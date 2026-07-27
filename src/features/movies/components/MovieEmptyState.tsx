import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { FilmReelIcon } from "@/components/ui/BrandIcons";
import "./movies.css";

interface Props { onReset: () => void }

const MovieEmptyState: FC<Props> = ({ onReset }) => {
    const { t } = useTranslation("movies");
    return (
        <div className="cgv-state-card" role="status" aria-live="polite">
            <div className="cgv-state-card__icon"><FilmReelIcon size={30} /></div>
            <h2 className="cgv-state-card__title">{t("empty.title")}</h2>
            <p className="cgv-state-card__body">
                {t("empty.body")}
            </p>
            <button className="cgv-state-card__btn cgv-state-card__btn--primary" onClick={onReset}>
                {t("empty.resetFilters")}
            </button>
        </div>
    );
};

export default MovieEmptyState;
