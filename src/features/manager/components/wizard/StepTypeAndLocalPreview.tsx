import { type FC } from "react";
import { InputNumber, Spin } from "antd";
import { useMovieList } from "../../hooks/useMovieList";
import { useShowtimeTypes } from "../../hooks/useShowtimeTypes";
import { CLEANING_DURATION_MIN } from "../../constants/showtimeType.constants";
import { computeLocalPreview } from "../../utils/showtimeType.utils";

interface Props {
    cinemaId: number;
    movieId: number | null;
    showtimeTypeId: number | null;
    basePrice: number | null;
    onSelectType: (id: number) => void;
    onBasePriceChange: (price: number | null) => void;
}

const StepTypeAndLocalPreview: FC<Props> = ({
    cinemaId, movieId, showtimeTypeId, basePrice, onSelectType, onBasePriceChange,
}) => {
    const { data: movieData } = useMovieList();
    const { data: typeData, isLoading } = useShowtimeTypes(cinemaId);

    const movie = movieData?.items.find((m) => m.movieId === movieId);
    const activeTypes = (typeData?.items ?? []).filter((t) => t.isActive);
    const selectedType = activeTypes.find((t) => t.id === showtimeTypeId);

    const localPreview = selectedType && movie?.durationMinutes
        ? computeLocalPreview(selectedType.slots, movie.durationMinutes, CLEANING_DURATION_MIN)
        : [];

    if (isLoading) {
        return <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spin /></div>;
    }

    return (
        <div className="stt-wizard-step">
            <p className="stt-wizard-step__title">Select a showtime type</p>

            {activeTypes.length === 0 ? (
                <p className="stt-wizard-step__empty">No active showtime types — create one first.</p>
            ) : (
                <div className="stt-type-list">
                    {activeTypes.map((t) => (
                        <button
                            type="button"
                            key={t.id}
                            className={`stt-type-card${showtimeTypeId === t.id ? " stt-type-card--selected" : ""}`}
                            onClick={() => onSelectType(t.id)}
                        >
                            <span className="stt-type-card__name">{t.name}</span>
                            <span className="stt-type-card__meta">{t.slots.length} slots/day</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="stt-field" style={{ marginTop: 20 }}>
                <label className="stt-field__label">Base Price (VND)</label>
                <InputNumber
                    value={basePrice}
                    onChange={onBasePriceChange}
                    min={0}
                    step={1000}
                    style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                />
            </div>

            {selectedType && movie && (
                <div className="stt-local-preview">
                    <p className="stt-wizard-step__sec-title">
                        Local Preview
                        <span className="stt-local-preview__hint">Estimated — not validated against conflicts yet</span>
                    </p>
                    {!movie.durationMinutes ? (
                        <p className="stt-wizard-step__empty">This movie has no duration set — can't estimate end times.</p>
                    ) : (
                        <div className="stt-local-preview__rows">
                            {localPreview.map((row) => (
                                <div className="stt-local-preview__row" key={row.slot}>
                                    <span>{row.start}</span>
                                    <span className="stt-local-preview__arrow">→</span>
                                    <span>{row.end}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StepTypeAndLocalPreview;
