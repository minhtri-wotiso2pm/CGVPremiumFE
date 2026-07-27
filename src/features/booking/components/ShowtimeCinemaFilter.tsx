import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { ShowtimeCinema } from "../types/showtime.types";

interface Props {
    cinemas: ShowtimeCinema[];
    selectedCinemaId: number | null;
    onChange: (cinemaId: number | null) => void;
}

const ShowtimeCinemaFilter: FC<Props> = ({ cinemas, selectedCinemaId, onChange }) => {
    const { t } = useTranslation("booking");
    if (cinemas.length === 0) return null;

    return (
        <div className="cgv-st-cinemas" role="group" aria-label={t("showtime.selectCinema")}>
            <button
                className={`cgv-st-cinema-btn${selectedCinemaId === null ? " cgv-st-cinema-btn--active" : ""}`}
                onClick={() => onChange(null)}
                aria-pressed={selectedCinemaId === null}
            >
                {t("showtime.allCinemas")}
            </button>
            {cinemas.map((cinema) => (
                <button
                    key={cinema.cinemaId}
                    className={`cgv-st-cinema-btn${selectedCinemaId === cinema.cinemaId ? " cgv-st-cinema-btn--active" : ""}`}
                    onClick={() => onChange(cinema.cinemaId)}
                    aria-pressed={selectedCinemaId === cinema.cinemaId}
                >
                    {cinema.cinemaName}
                </button>
            ))}
        </div>
    );
};

export default ShowtimeCinemaFilter;
