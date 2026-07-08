import { type FC } from "react";
import type { Dayjs } from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";
import CalendarBlock from "./CalendarBlock";

interface Props {
    date: Dayjs;
    items: ManagerShowtime[];
    onSelect: (showtime: ManagerShowtime) => void;
}

const CalendarDayView: FC<Props> = ({ items, onSelect }) => (
    <div className="cal-day">
        {items.length === 0 ? (
            <p className="cal-empty">No showtimes scheduled for this day.</p>
        ) : (
            <div className="cal-day__list">
                {items.map((s) => (
                    <CalendarBlock key={s.showtimeId} showtime={s} onClick={onSelect} />
                ))}
            </div>
        )}
    </div>
);

export default CalendarDayView;
