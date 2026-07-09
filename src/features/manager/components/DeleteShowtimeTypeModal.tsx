import { type FC } from "react";
import { createPortal } from "react-dom";
import type { ShowtimeTypeListItem } from "../types/showtimeType.types";
import { useDeleteShowtimeType } from "../hooks/useShowtimeTypes";

const WarnIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

interface Props {
    showtimeType: ShowtimeTypeListItem | null;
    open: boolean;
    onClose: () => void;
}

const DeleteShowtimeTypeModal: FC<Props> = ({ showtimeType, open, onClose }) => {
    const { mutate: deleteType, isPending } = useDeleteShowtimeType();

    if (!open || !showtimeType) return null;

    const handleConfirm = () => {
        deleteType(showtimeType.id, { onSuccess: onClose });
    };

    return createPortal(
        <div className="stt-modal-overlay" onClick={() => { if (!isPending) onClose(); }}>
            <div className="stt-modal stt-modal--sm" onClick={(e) => e.stopPropagation()}>
                <div className="stt-confirm">
                    <div className="stt-confirm__icon"><WarnIcon /></div>
                    <h2 className="stt-confirm__title">Delete showtime type?</h2>
                    <p className="stt-confirm__body">
                        <strong>{showtimeType.name}</strong> and its {showtimeType.slots.length} slot{showtimeType.slots.length !== 1 ? "s" : ""} will be permanently removed. This cannot be undone.
                    </p>
                    <div className="stt-confirm__actions">
                        <button className="stt-btn stt-btn--ghost" onClick={onClose} disabled={isPending}>
                            Cancel
                        </button>
                        <button className="stt-btn stt-btn--danger" onClick={handleConfirm} disabled={isPending}>
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default DeleteShowtimeTypeModal;
