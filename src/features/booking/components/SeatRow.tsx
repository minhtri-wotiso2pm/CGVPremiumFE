import type { FC } from "react";
import type { Seat } from "../types/seat.types";
import SeatComponent from "./Seat";

interface Props {
    rowLabel: string;
    seats: Seat[];
    selectedSeatIds: Set<number>;
    onSeatSelect: (seat: Seat) => void;
}

const SeatRow: FC<Props> = ({ rowLabel, seats, selectedSeatIds, onSeatSelect }) => (
    <div className="cgv-seats-row" role="row" aria-label={`Row ${rowLabel}`}>
        <span className="cgv-seats-row-label" aria-hidden="true">{rowLabel}</span>
        {seats.map((seat) => (
            <SeatComponent
                key={seat.seatId}
                seat={seat}
                isSelected={selectedSeatIds.has(seat.seatId)}
                onSelect={onSeatSelect}
            />
        ))}
        <span className="cgv-seats-row-label" aria-hidden="true">{rowLabel}</span>
    </div>
);

export default SeatRow;
