import { type FC } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";
import CalendarBlock from "./CalendarBlock";

interface Props {
    weekStart: Dayjs;
    groupedByDate: Map<string, ManagerShowtime[]>;
    onSelect: (showtime: ManagerShowtime) => void;
}

const CalendarWeekView: FC<Props> = ({ weekStart, groupedByDate, onSelect }) => {
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
    const today = dayjs().format("YYYY-MM-DD");

    return (
        <div className="cal-week">
            {days.map((day) => {
                const key = day.format("YYYY-MM-DD");
                const items = groupedByDate.get(key) ?? [];
                return (
                    <div className={`cal-week__col${key === today ? " cal-week__col--today" : ""}`} key={key}>
                        <div className="cal-week__col-header">
                            <span className="cal-week__col-day">{day.format("ddd")}</span>
                            <span className="cal-week__col-date">{day.format("DD")}</span>
                        </div>
                        <div className="cal-week__col-body">
                            {items.length === 0 ? (
                                <span className="cal-empty cal-empty--sm">—</span>
                            ) : (
                                items.map((s) => (
                                    <CalendarBlock key={s.showtimeId} showtime={s} onClick={onSelect} compact />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarWeekView;
