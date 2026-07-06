import { type FC, useCallback } from "react";
import type { Seat as SeatType } from "../types/seat.types";
import { isSeatSelectable, getSeatLabel } from "../utils/seat.utils";

interface Props {
    seat: SeatType;
    isSelected: boolean;
    onSelect: (seat: SeatType) => void;
}

const Seat: FC<Props> = ({ seat, isSelected, onSelect }) => {
    const selectable = isSeatSelectable(seat);
    const seatType = (seat.seatType ?? "STANDARD").toString().toUpperCase();

    const handleClick = useCallback(() => {
        if (selectable) onSelect(seat);
    }, [selectable, onSelect, seat]);

    const classNames = [
        "cgv-seat",
        isSelected
            ? "cgv-seat--selected"
            : selectable
            ? "cgv-seat--available"
            : "cgv-seat--unavailable",
        seatType !== "STANDARD" ? `cgv-seat--${seatType.toLowerCase()}` : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            className={classNames}
            onClick={handleClick}
            disabled={!selectable}
            aria-label={`${getSeatLabel(seat)}${isSelected ? " (selected)" : selectable ? "" : " (unavailable)"}`}
            aria-pressed={isSelected}
            title={
                selectable
                    ? `${getSeatLabel(seat)} · ${seat.seatType}`
                    : `${getSeatLabel(seat)} · Unavailable`
            }
        >
            <span className="cgv-seat__col">{seat.seatCol}</span>
        </button>
    );
};

export default Seat;
