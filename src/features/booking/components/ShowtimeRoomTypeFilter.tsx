import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { ALL_ROOM_TYPES } from "../constants/showtime.constants";

interface Props {
    roomTypes: string[];
    selected: string;
    onChange: (type: string) => void;
}

const ShowtimeRoomTypeFilter: FC<Props> = ({ roomTypes, selected, onChange }) => {
    const { t } = useTranslation("booking");
    if (roomTypes.length === 0) return null;

    return (
        <div className="cgv-st-roomtypes" role="group" aria-label={t("showtime.filterRoomType")}>
            <button
                className={`cgv-st-roomtype${selected === ALL_ROOM_TYPES ? " cgv-st-roomtype--active" : ""}`}
                onClick={() => onChange(ALL_ROOM_TYPES)}
                aria-pressed={selected === ALL_ROOM_TYPES}
            >
                {t("showtime.allRoomTypes")}
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
