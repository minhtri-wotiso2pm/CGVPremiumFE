import { type FC } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";

const MAX_VISIBLE = 3;

interface Props {
    monthStart: Dayjs;
    groupedByDate: Map<string, ManagerShowtime[]>;
    onSelect: (showtime: ManagerShowtime) => void;
    onShowMore: (date: Dayjs, items: ManagerShowtime[]) => void;
}

const CalendarMonthView: FC<Props> = ({ monthStart, groupedByDate, onSelect, onShowMore }) => {
    const gridStart = monthStart.startOf("week");
    const gridEnd = monthStart.endOf("month").endOf("week");
    const days: Dayjs[] = [];
    let cursor = gridStart;
    while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, "day")) {
        days.push(cursor);
        cursor = cursor.add(1, "day");
    }

    const today = dayjs().format("YYYY-MM-DD");

    return (
        <div className="cal-month">
            <div className="cal-month__weekdays">
                {days.slice(0, 7).map((d) => (
                    <span key={d.format("ddd")}>{d.format("ddd")}</span>
                ))}
            </div>
            <div className="cal-month__grid">
                {days.map((day) => {
                    const key = day.format("YYYY-MM-DD");
                    const items = groupedByDate.get(key) ?? [];
                    const isCurrentMonth = day.isSame(monthStart, "month");
                    const visible = items.slice(0, MAX_VISIBLE);
                    const rest = items.length - visible.length;

                    return (
                        <div
                            className={`cal-month__cell${isCurrentMonth ? "" : " cal-month__cell--outside"}${key === today ? " cal-month__cell--today" : ""}`}
                            key={key}
                        >
                            <span className="cal-month__cell-date">{day.format("D")}</span>
                            <div className="cal-month__cell-items">
                                {visible.map((s) => (
                                    <button
                                        type="button"
                                        key={s.showtimeId}
                                        className={`cal-month__chip cal-month__chip--${s.status}`}
                                        onClick={() => onSelect(s)}
                                        title={s.movie.title}
                                    >
                                        {dayjs(s.startTime.slice(0, 19)).format("HH:mm")} {s.movie.title}
                                    </button>
                                ))}
                                {rest > 0 && (
                                    <button
                                        type="button"
                                        className="cal-month__more"
                                        onClick={() => onShowMore(day, items)}
                                    >
                                        +{rest} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarMonthView;
