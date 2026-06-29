import type { FC } from "react";
import type { ShowtimeCinema } from "../types/showtime.types";

interface Props {
    cinemas: ShowtimeCinema[];
    selectedCinemaId: number | null;
    onChange: (cinemaId: number | null) => void;
}

const ShowtimeCinemaFilter: FC<Props> = ({ cinemas, selectedCinemaId, onChange }) => {
    if (cinemas.length === 0) return null;

    return (
        <div className="cgv-st-cinemas" role="group" aria-label="Select cinema">
            <button
                className={`cgv-st-cinema-btn${selectedCinemaId === null ? " cgv-st-cinema-btn--active" : ""}`}
                onClick={() => onChange(null)}
                aria-pressed={selectedCinemaId === null}
            >
                All Cinemas
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
