import { type FC } from "react";
import type { Dayjs } from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";
import CalendarTimeGrid from "./CalendarTimeGrid";

interface Props {
    weekStart: Dayjs;
    groupedByDate: Map<string, ManagerShowtime[]>;
    onSelect: (showtime: ManagerShowtime) => void;
}

const CalendarWeekView: FC<Props> = ({ weekStart, groupedByDate, onSelect }) => {
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
    return <CalendarTimeGrid days={days} groupedByDate={groupedByDate} onSelect={onSelect} />;
};

export default CalendarWeekView;
