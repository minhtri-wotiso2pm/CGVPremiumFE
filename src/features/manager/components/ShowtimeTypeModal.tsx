import { type FC, useState } from "react";
import { Input, Switch } from "antd";
import type { ShowtimeTypeListItem, ShowtimeTypeModalType } from "../types/showtimeType.types";
import { useCreateShowtimeType, useUpdateShowtimeType } from "../hooks/useShowtimeTypes";
import { fromApiSlots, toApiSlots, validateSlots } from "../utils/showtimeType.utils";
import SlotListEditor from "./SlotListEditor";

interface Props {
    mode: ShowtimeTypeModalType;
    showtimeType?: ShowtimeTypeListItem | null;
    cinemaId: number;
    open: boolean;
    onClose: () => void;
}

const MODAL_TITLE: Record<ShowtimeTypeModalType, string> = {
    create: "New Showtime Type",
    edit: "Edit Showtime Type",
    clone: "Clone Showtime Type",
    delete: "",
};

interface FormProps {
    mode: ShowtimeTypeModalType;
    showtimeType?: ShowtimeTypeListItem | null;
    cinemaId: number;
    onClose: () => void;
}

/** Keyed by mode+id from the wrapper below, so opening for a different
 *  item (or a different mode on the same item) remounts this with fresh
 *  lazy-initialized state — no effect needed to "reset" fields on open. */
const ShowtimeTypeModalForm: FC<FormProps> = ({ mode, showtimeType, cinemaId, onClose }) => {
    const isEdit = mode === "edit";
    const isClone = mode === "clone";

    const [name, setName] = useState(() =>
        showtimeType ? (isClone ? `${showtimeType.name} Copy` : showtimeType.name) : ""
    );
    const [isActive, setIsActive] = useState(() =>
        showtimeType ? (isClone ? false : showtimeType.isActive) : true
    );
    const [slots, setSlots] = useState<string[]>(() =>
        showtimeType ? fromApiSlots(showtimeType.slots) : []
    );
    const [slotError, setSlotError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const { mutate: create, isPending: creating } = useCreateShowtimeType();
    const { mutate: update, isPending: updating } = useUpdateShowtimeType();
    const isLoading = creating || updating;

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const nErr = trimmedName ? null : "Name is required.";
        const sErr = validateSlots(slots);
        setNameError(nErr);
        setSlotError(sErr);
        if (nErr || sErr) return;

        const apiSlots = toApiSlots(slots);

        if (isEdit && showtimeType) {
            update(
                { id: showtimeType.id, payload: { name: trimmedName, isActive, slots: apiSlots } },
                { onSuccess: onClose },
            );
        } else {
            create(
                { cinemaId, name: trimmedName, slots: apiSlots },
                { onSuccess: onClose },
            );
        }
    };

    return (
        <div className="stt-modal-overlay" onClick={() => { if (!isLoading) onClose(); }}>
            <div className="stt-modal" onClick={(e) => e.stopPropagation()}>
                <div className="stt-modal__header">
                    <h2 className="stt-modal__title">{MODAL_TITLE[mode]}</h2>
                    <button className="stt-modal__close" onClick={onClose} disabled={isLoading} aria-label="Close">×</button>
                </div>

                <div className="stt-modal__body">
                    <div className="stt-field">
                        <label className="stt-field__label">Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Weekend Standard"
                            maxLength={100}
                            disabled={isLoading}
                            status={nameError ? "error" : undefined}
                        />
                        {nameError && <span className="stt-field__error">{nameError}</span>}
                    </div>

                    {isEdit && (
                        <div className="stt-field stt-field--row">
                            <label className="stt-field__label">Active</label>
                            <Switch checked={isActive} onChange={setIsActive} disabled={isLoading} />
                        </div>
                    )}

                    <div className="stt-field">
                        <label className="stt-field__label">Slot List</label>
                        <SlotListEditor slots={slots} onChange={setSlots} disabled={isLoading} />
                        {slotError && <span className="stt-field__error">{slotError}</span>}
                    </div>
                </div>

                <div className="stt-modal__footer">
                    <button className="stt-btn stt-btn--ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button className="stt-btn stt-btn--primary" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : isEdit ? "Save Changes" : isClone ? "Create Clone" : "Create Showtime Type"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShowtimeTypeModal: FC<Props> = ({ mode, showtimeType, cinemaId, open, onClose }) => {
    if (!open) return null;
    return (
        <ShowtimeTypeModalForm
            key={`${mode}-${showtimeType?.id ?? "new"}`}
            mode={mode}
            showtimeType={showtimeType}
            cinemaId={cinemaId}
            onClose={onClose}
        />
    );
};

export default ShowtimeTypeModal;
