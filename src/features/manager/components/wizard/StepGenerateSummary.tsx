import { type FC } from "react";
import type { GenerateWizardState } from "../../types/generateWizard.types";
import { useMovieList } from "../../hooks/useMovieList";
import { useRooms } from "../../hooks/useRooms";
import { useShowtimeTypes, useGenerateShowtimeType } from "../../hooks/useShowtimeTypes";

interface Props {
    state: GenerateWizardState;
    onGenerated: () => void;
}

const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const StepGenerateSummary: FC<Props> = ({ state, onGenerated }) => {
    const { data: movieData } = useMovieList();
    const { data: allRooms = [] } = useRooms();
    const cinemaId = allRooms.find((r) => r.roomId === state.roomId)?.cinemaId ?? null;
    const { data: typeData } = useShowtimeTypes(cinemaId);
    const { mutate: generate, isPending, data: result, isError } = useGenerateShowtimeType();

    const movie = movieData?.items.find((m) => m.movieId === state.movieId);
    const room = allRooms.find((r) => r.roomId === state.roomId);
    const type = typeData?.items.find((t) => t.id === state.showtimeTypeId);

    const handleGenerate = () => {
        if (!state.movieId || !state.roomId || !state.showtimeTypeId || !state.basePrice || !state.dateRange) return;
        generate(
            {
                movieId: state.movieId,
                roomId: state.roomId,
                showtimeTypeId: state.showtimeTypeId,
                basePrice: state.basePrice,
                startDate: state.dateRange[0].format("YYYY-MM-DD"),
                endDate: state.dateRange[1].format("YYYY-MM-DD"),
            },
            { onSuccess: () => onGenerated() },
        );
    };

    return (
        <div className="stt-wizard-step">
            <p className="stt-wizard-step__title">Review &amp; generate</p>

            <div className="stt-summary-list">
                <div className="stt-summary-row">
                    <span className="stt-summary-row__label">Movie</span>
                    <span className="stt-summary-row__value">{movie?.title ?? "—"}</span>
                </div>
                <div className="stt-summary-row">
                    <span className="stt-summary-row__label">Room</span>
                    <span className="stt-summary-row__value">{room?.name ?? "—"}</span>
                </div>
                <div className="stt-summary-row">
                    <span className="stt-summary-row__label">Showtime Type</span>
                    <span className="stt-summary-row__value">{type?.name ?? "—"} ({type?.slots.length ?? 0} slots/day)</span>
                </div>
                <div className="stt-summary-row">
                    <span className="stt-summary-row__label">Date Range</span>
                    <span className="stt-summary-row__value">
                        {state.dateRange ? `${state.dateRange[0].format("DD/MM/YYYY")} – ${state.dateRange[1].format("DD/MM/YYYY")}` : "—"}
                    </span>
                </div>
                <div className="stt-summary-row">
                    <span className="stt-summary-row__label">Base Price</span>
                    <span className="stt-summary-row__value">{state.basePrice ? formatVnd(state.basePrice) : "—"}</span>
                </div>
            </div>

            <p className="stt-wizard-step__note">
                Showtimes that conflict with existing schedules will be automatically skipped — nothing else is rolled back.
            </p>

            {isError && (
                <p className="stt-field__error" style={{ marginTop: 8 }}>
                    Couldn't generate showtimes. Please try again.
                </p>
            )}

            {result && (
                <div className="stt-preview-summary" style={{ marginTop: 16 }}>
                    <div className="stt-preview-summary__item stt-preview-summary__item--valid">
                        <span className="stt-preview-summary__count">{result.generatedCount}</span>
                        <span>Generated</span>
                    </div>
                    <div className="stt-preview-summary__item stt-preview-summary__item--conflict">
                        <span className="stt-preview-summary__count">{result.skippedCount}</span>
                        <span>Skipped</span>
                    </div>
                </div>
            )}

            <button
                className="stt-btn stt-btn--primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "11px 0" }}
                onClick={handleGenerate}
                disabled={isPending}
            >
                {isPending ? "Generating..." : "Generate Showtimes"}
            </button>
        </div>
    );
};

export default StepGenerateSummary;
