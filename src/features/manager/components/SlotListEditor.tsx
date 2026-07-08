import { type FC } from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";

const PlusIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

interface Props {
    /** "HH:mm" strings, one per slot. */
    slots: string[];
    onChange: (slots: string[]) => void;
    disabled?: boolean;
}

/** Add/remove editor for a showtime type's daily slot times. Built from
 *  scratch (not a bare antd form list) so it reads as a deliberate,
 *  enterprise-grade input rather than a default AntD list widget. */
const SlotListEditor: FC<Props> = ({ slots, onChange, disabled }) => {
    const updateSlot = (index: number, value: string | null) => {
        const next = [...slots];
        next[index] = value ?? "";
        onChange(next);
    };

    const removeSlot = (index: number) => {
        onChange(slots.filter((_, i) => i !== index));
    };

    const addSlot = () => {
        onChange([...slots, ""]);
    };

    return (
        <div className="stt-slots">
            {slots.length === 0 ? (
                <div className="stt-slots__empty">
                    <ClockIcon />
                    <span>No slots yet — add the daily showtimes for this type.</span>
                </div>
            ) : (
                <div className="stt-slots__list">
                    {slots.map((slot, i) => {
                        const isDuplicate = !!slot && slots.filter((s) => s === slot).length > 1;
                        return (
                            <div className={`stt-slot-row${isDuplicate ? " stt-slot-row--error" : ""}`} key={i}>
                                <span className="stt-slot-row__index">{i + 1}</span>
                                <TimePicker
                                    value={slot ? dayjs(slot, "HH:mm") : null}
                                    onChange={(v) => updateSlot(i, v ? v.format("HH:mm") : null)}
                                    format="HH:mm"
                                    minuteStep={5}
                                    disabled={disabled}
                                    placeholder="Select time"
                                    allowClear={false}
                                    style={{ flex: 1 }}
                                    className="stt-slot-row__picker"
                                />
                                <button
                                    type="button"
                                    className="stt-slot-row__remove"
                                    onClick={() => removeSlot(i)}
                                    disabled={disabled}
                                    aria-label={`Remove slot ${i + 1}`}
                                >
                                    <TrashIcon />
                                </button>
                                {isDuplicate && <span className="stt-slot-row__error">Duplicate time</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            <button type="button" className="stt-slot-add" onClick={addSlot} disabled={disabled}>
                <PlusIcon />
                Add Slot
            </button>
        </div>
    );
};

export default SlotListEditor;
