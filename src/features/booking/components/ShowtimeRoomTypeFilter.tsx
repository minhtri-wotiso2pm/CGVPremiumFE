import type { FC } from "react";
import { ALL_ROOM_TYPES } from "../constants/showtime.constants";

interface Props {
    roomTypes: string[];
    selected: string;
    onChange: (type: string) => void;
}

const ShowtimeRoomTypeFilter: FC<Props> = ({ roomTypes, selected, onChange }) => {
    if (roomTypes.length === 0) return null;

    return (
        <div className="cgv-st-roomtypes" role="group" aria-label="Filter by room type">
            <button
                className={`cgv-st-roomtype${selected === ALL_ROOM_TYPES ? " cgv-st-roomtype--active" : ""}`}
                onClick={() => onChange(ALL_ROOM_TYPES)}
                aria-pressed={selected === ALL_ROOM_TYPES}
            >
                All
            </button>
            {roomTypes.map((type) => (
                <button
                    key={type}
                    className={`cgv-st-roomtype${selected === type ? " cgv-st-roomtype--active" : ""}`}
                    onClick={() => onChange(type)}
                    aria-pressed={selected === type}
                >
                    {type}
                </button>
            ))}
        </div>
    );
};

export default ShowtimeRoomTypeFilter;
