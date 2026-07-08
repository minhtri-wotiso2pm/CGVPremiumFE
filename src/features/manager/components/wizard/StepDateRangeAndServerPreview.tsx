import { type FC, useMemo, useState } from "react";
import { DatePicker, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { GenerateWizardState } from "../../types/generateWizard.types";
import { usePreviewShowtimeType } from "../../hooks/useShowtimeTypes";
import type { ShowtimeTypePreviewItem } from "../../types/showtimeType.types";

const { RangePicker } = DatePicker;

interface Props {
    state: GenerateWizardState;
    onDateRangeChange: (range: [Dayjs, Dayjs] | null) => void;
    onPreviewComplete: () => void;
}

const fmtTime = (iso: string) => dayjs(iso).format("HH:mm");

const StepDateRangeAndServerPreview: FC<Props> = ({ state, onDateRangeChange, onPreviewComplete }) => {
    const { mutate: runPreview, data, isPending, isError } = usePreviewShowtimeType();
    const [hasRun, setHasRun] = useState(false);

    const grouped = useMemo(() => {
        const map = new Map<string, ShowtimeTypePreviewItem[]>();
        for (const item of data?.items ?? []) {
            if (!map.has(item.date)) map.set(item.date, []);
            map.get(item.date)!.push(item);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [data]);

    const handleRunPreview = () => {
        if (!state.movieId || !state.roomId || !state.showtimeTypeId || !state.basePrice || !state.dateRange) return;
        runPreview(
            {
                movieId: state.movieId,
                roomId: state.roomId,
                showtimeTypeId: state.showtimeTypeId,
                basePrice: state.basePrice,
                startDate: state.dateRange[0].format("YYYY-MM-DD"),
                endDate: state.dateRange[1].format("YYYY-MM-DD"),
            },
            {
                onSuccess: () => {
                    setHasRun(true);
                    onPreviewComplete();
                },
            },
        );
    };

    return (
        <div className="stt-wizard-step">
            <p className="stt-wizard-step__title">Choose a date range</p>

            <div className="stt-preview-controls">
                <RangePicker
                    value={state.dateRange}
                    onChange={(vals) => {
                        setHasRun(false);
                        if (vals && vals[0] && vals[1]) onDateRangeChange([vals[0], vals[1]]);
                        else onDateRangeChange(null);
                    }}
                    format="DD/MM/YYYY"
                />
                <button
                    className="stt-btn stt-btn--primary"
                    onClick={handleRunPreview}
                    disabled={!state.dateRange || isPending}
                >
                    {isPending ? "Checking..." : "Run Server Preview"}
                </button>
            </div>

            {isError && (
                <p className="stt-field__error" style={{ marginTop: 12 }}>
                    Couldn't generate a preview. Please try again.
                </p>
            )}

            {data && hasRun && (
                <>
                    <div className="stt-preview-summary">
                        <div className="stt-preview-summary__item stt-preview-summary__item--valid">
                            <span className="stt-preview-summary__count">{data.validCount}</span>
                            <span>Valid</span>
                        </div>
                        <div className="stt-preview-summary__item stt-preview-summary__item--conflict">
                            <span className="stt-preview-summary__count">{data.conflictCount}</span>
                            <span>Conflict</span>
                        </div>
                    </div>

                    <p className="stt-wizard-step__sec-title">Calendar Timeline</p>
                    <div className="stt-preview-calendar">
                        {grouped.map(([date, items]) => (
                            <div className="stt-preview-day" key={date}>
                                <span className="stt-preview-day__date">{dayjs(date).format("ddd, DD/MM")}</span>
                                <div className="stt-preview-day__slots">
                                    {items.map((item, i) => (
                                        <Tooltip
                                            key={i}
                                            title={item.isConflict
                                                ? `${item.reason ?? "Conflict"} · ${fmtTime(item.startTime)}–${fmtTime(item.endTime)}`
                                                : `Valid · ${fmtTime(item.startTime)}–${fmtTime(item.endTime)}`}
                                        >
                                            <span className={`stt-preview-slot${item.isConflict ? " stt-preview-slot--conflict" : " stt-preview-slot--valid"}`}>
                                                {fmtTime(item.startTime)}
                                                <span className="stt-preview-slot__dot" />
                                            </span>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default StepDateRangeAndServerPreview;
