import { type FC } from "react";
import dayjs from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";

const STATUS_CLASS: Record<string, string> = {
    scheduled: "cal-block--scheduled",
    completed: "cal-block--completed",
    cancelled: "cal-block--cancelled",
};

interface Props {
    showtime: ManagerShowtime;
    onClick: (showtime: ManagerShowtime) => void;
    compact?: boolean;
}

const CalendarBlock: FC<Props> = ({ showtime, onClick, compact }) => (
    <button
        type="button"
        className={`cal-block ${STATUS_CLASS[showtime.status] ?? "cal-block--scheduled"}${compact ? " cal-block--compact" : ""}`}
        onClick={() => onClick(showtime)}
        title={`${showtime.movie.title} · ${dayjs(showtime.startTime.slice(0, 19)).format("HH:mm")}`}
    >
        <span className="cal-block__time">{dayjs(showtime.startTime.slice(0, 19)).format("HH:mm")}</span>
        <span className="cal-block__title">{showtime.movie.title}</span>
        {!compact && <span className="cal-block__room">{showtime.room.roomName}</span>}
    </button>
);

export default CalendarBlock;
