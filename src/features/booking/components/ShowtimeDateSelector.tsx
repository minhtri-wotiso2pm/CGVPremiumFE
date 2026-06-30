import type { FC } from "react";
import { SHOWTIME_DATE_COUNT } from "../constants/showtime.constants";
import { generateDateRange, getDateLabel, toDateParam } from "../utils/showtime.utils";

interface Props {
    selectedDate: string;
    onChange: (date: string) => void;
}

const dates = generateDateRange(SHOWTIME_DATE_COUNT);

const ShowtimeDateSelector: FC<Props> = ({ selectedDate, onChange }) => (
    <div className="cgv-st-dates" role="group" aria-label="Select date">
        {dates.map((date, i) => {
            const param = toDateParam(date);
            const { day, num, month } = getDateLabel(date, i);
            const isActive = selectedDate === param;
            return (
                <button
                    key={param}
                    className={`cgv-st-date${isActive ? " cgv-st-date--active" : ""}`}
                    onClick={() => onChange(param)}
                    aria-pressed={isActive}
                    aria-label={`${day} ${num} ${month}`}
                >
                    {i === 0
                        ? <span className="cgv-st-date__today-badge">TODAY</span>
                        : <span className="cgv-st-date__day">{day}</span>
                    }
                    <span className="cgv-st-date__num">{num}</span>
                    <span className="cgv-st-date__month">{month}</span>
                </button>
            );
        })}
    </div>
);

export default ShowtimeDateSelector;
