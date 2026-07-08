import { type FC } from "react";
import { useShowtimeTypeDetail } from "../hooks/useShowtimeTypes";
import { formatSlotShort } from "../utils/showtimeType.utils";

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const WandIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h0M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
    </svg>
);

interface Props {
    showtimeTypeId: number | null;
    onClose: () => void;
    onGenerateFromType?: (showtimeTypeId: number) => void;
}

/** Client-only preview — no generate call, no API beyond the detail
 *  fetch already used for Edit. Purely reads data already available. */
const QuickPreviewDrawer: FC<Props> = ({ showtimeTypeId, onClose, onGenerateFromType }) => {
    const { data, isLoading } = useShowtimeTypeDetail(showtimeTypeId);
    const open = showtimeTypeId != null;

    const sortedSlots = data ? [...data.slots].sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];
    const first = sortedSlots[0]?.startTime;
    const last = sortedSlots[sortedSlots.length - 1]?.startTime;

    return (
        <>
            <div className={`stt-drawer-overlay${open ? " stt-drawer-overlay--open" : ""}`} onClick={onClose} aria-hidden="true" />
            <aside className={`stt-drawer${open ? " stt-drawer--open" : ""}`} aria-hidden={!open}>
                {data && (
                    <>
                        <div className="stt-drawer__header">
                            <div>
                                <p className="stt-drawer__eyebrow">Quick Preview</p>
                                <h2 className="stt-drawer__title">{data.name}</h2>
                            </div>
                            <button className="stt-drawer__close" onClick={onClose} aria-label="Close preview">
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="stt-drawer__body">
                            {isLoading ? (
                                <div className="stt-drawer__skel" />
                            ) : (
                                <>
                                    <div className="stt-drawer__stats">
                                        <div className="stt-drawer__stat">
                                            <span className="stt-drawer__stat-label">Total Slots</span>
                                            <span className="stt-drawer__stat-value">{sortedSlots.length}</span>
                                        </div>
                                        <div className="stt-drawer__stat">
                                            <span className="stt-drawer__stat-label">First Slot</span>
                                            <span className="stt-drawer__stat-value">{first ? formatSlotShort(first) : "—"}</span>
                                        </div>
                                        <div className="stt-drawer__stat">
                                            <span className="stt-drawer__stat-label">Last Slot</span>
                                            <span className="stt-drawer__stat-value">{last ? formatSlotShort(last) : "—"}</span>
                                        </div>
                                        <div className="stt-drawer__stat">
                                            <span className="stt-drawer__stat-label">Status</span>
                                            <span className={`dash-badge ${data.isActive ? "dash-badge--active" : "dash-badge--inactive"}`}>
                                                {data.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="stt-drawer__sec-title">Timeline</p>
                                    <div className="stt-timeline">
                                        {sortedSlots.map((slot) => (
                                            <div className="stt-timeline__item" key={slot.id}>
                                                <span className="stt-timeline__dot" />
                                                <span className="stt-timeline__time">{formatSlotShort(slot.startTime)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {onGenerateFromType && (
                            <div className="stt-drawer__footer">
                                <button
                                    className="stt-btn stt-btn--primary"
                                    style={{ width: "100%" }}
                                    onClick={() => onGenerateFromType(data.id)}
                                >
                                    <WandIcon />
                                    Use This Type to Generate
                                </button>
                            </div>
                        )}
                    </>
                )}
            </aside>
        </>
    );
};

export default QuickPreviewDrawer;
