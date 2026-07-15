import { type FC, useMemo } from "react";
import { Spin } from "antd";
import { useRooms } from "../../hooks/useRooms";
import { useRoomTypes } from "../../hooks/useRoomTypes";

const RoomIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

interface Props {
    cinemaId: number;
    roomId: number | null;
    onSelect: (roomId: number) => void;
}

const StepRoomSelect: FC<Props> = ({ cinemaId, roomId, onSelect }) => {
    const { data: allRooms = [], isLoading } = useRooms();
    const { data: roomTypes = [] } = useRoomTypes();
    const roomTypeById = useMemo(
        () => new Map(roomTypes.map((t) => [t.roomTypeId, t])),
        [roomTypes],
    );
    const rooms = allRooms.filter((r) => r.cinemaId === cinemaId && r.status === "ACTIVE");

    if (isLoading) {
        return <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spin /></div>;
    }

    return (
        <div className="stt-wizard-step">
            <p className="stt-wizard-step__title">Select a room</p>
            {rooms.length === 0 ? (
                <p className="stt-wizard-step__empty">No active rooms for your cinema — create one first.</p>
            ) : (
                <div className="stt-room-list">
                    {rooms.map((r) => (
                        <button
                            type="button"
                            key={r.roomId}
                            className={`stt-room-card${roomId === r.roomId ? " stt-room-card--selected" : ""}`}
                            onClick={() => onSelect(r.roomId)}
                        >
                            <span className="stt-room-card__icon"><RoomIcon /></span>
                            <div className="stt-room-card__info">
                                <span className="stt-room-card__name">{r.name}</span>
                                <span className="stt-room-card__meta">{roomTypeById.get(r.roomTypeId)?.typeName ?? "—"} · {r.capacity} seats</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StepRoomSelect;
