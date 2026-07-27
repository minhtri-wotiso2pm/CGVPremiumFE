import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { Seat } from "../types/seat.types";
import CinemaScreen from "./CinemaScreen";
import SeatRow from "./SeatRow";

interface Props {
    seatRowMap: Map<string, Seat[]>;
    selectedSeatIds: Set<number>;
    onSeatSelect: (seat: Seat) => void;
}

const SeatMap: FC<Props> = ({ seatRowMap, selectedSeatIds, onSeatSelect }) => {
    const { t } = useTranslation("booking");
    return (
        <div className="cgv-seats-grid" role="grid" aria-label={t("seats.seatMap")}>
            <CinemaScreen />
            <div className="cgv-seats-rows">
                {Array.from(seatRowMap.entries()).map(([row, seats]) => (
                    <SeatRow
                        key={row}
                        rowLabel={row}
                        seats={seats}
                        selectedSeatIds={selectedSeatIds}
                        onSeatSelect={onSeatSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default SeatMap;
