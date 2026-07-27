import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { ShowtimeItem } from "../types/showtime.types";
import { formatShowtime, isShowtimePast } from "../utils/showtime.utils";

interface Props {
    showtime: ShowtimeItem;
    onSelect: (showtimeId: number) => void;
}

const ShowtimeCard: FC<Props> = ({ showtime, onSelect }) => {
    const { t } = useTranslation("booking");
    const past = isShowtimePast(showtime.startTime);
    const disabled = showtime.isSoldOut || past;

    let cls = "cgv-st-card";
    if (showtime.isSoldOut) cls += " cgv-st-card--soldout";
    else if (past) cls += " cgv-st-card--disabled";

    return (
        <button
            className={cls}
            onClick={() => !disabled && onSelect(showtime.showtimeId)}
            disabled={disabled}
            aria-label={`${formatShowtime(showtime.startTime)} — ${showtime.room.roomName}${showtime.isSoldOut ? ` (${t("showtime.soldOut")})` : past ? ` (${t("showtime.past")})` : ""}`}
        >
            <span className="cgv-st-card__time">
                {formatShowtime(showtime.startTime)}
            </span>
            <span className="cgv-st-card__room">
                {showtime.room.roomName}
            </span>
            {showtime.isSoldOut && (
                <span className="cgv-st-card__soldout-label">{t("showtime.soldOut")}</span>
            )}
        </button>
    );
};

export default ShowtimeCard;
