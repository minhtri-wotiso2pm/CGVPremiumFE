import type { FC } from "react";

import type { Seat } from "@/features/booking/types/seat.types";

interface FnBItem {
    productId?: string | number;
    productName?: string;
    quantity?: number;
}

interface Props {
    movieTitle?: string;
    moviePoster?: string;
    cinemaName?: string;
    roomName?: string;
    startTime?: string;
    selectedSeats: Seat[];
    fnbItems: FnBItem[];
}

function formatShowtime(startTime?: string) {
    if (!startTime) return "";

    return new Date(startTime).toLocaleString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const MovieInfoCard: FC<Props> = ({
    movieTitle,
    moviePoster,
    cinemaName,
    roomName,
    startTime,
    selectedSeats,
    fnbItems,
}) => {

    return (
    <div className="payment-card movie-card">

        <div className="movie-layout">

            <img
                src={moviePoster}
                alt={movieTitle}
                className="movie-poster"
            />

            <div className="movie-content">

                <h2 className="movie-title">
                    {movieTitle}
                </h2>

                <div className="movie-info-grid">

                    <div className="movie-info-item">
                        <span>🎬 Rạp</span>
                        <b>{cinemaName}</b>
                    </div>

                    <div className="movie-info-item">
                        <span>🏛 Phòng</span>
                        <b>{roomName}</b>
                    </div>

                    <div className="movie-info-item full">
                        <span>🕒 Suất chiếu</span>

                        <b className="highlight">
                            {formatShowtime(startTime)}
                        </b>
                    </div>

                </div>

                <div className="divider"/>

                <div className="movie-section">

                    <h4 className="section-title">
                        Ghế đã chọn
                    </h4>

                    <div className="seat-list">

                        {selectedSeats.map(seat=>(
                            <div
                                key={seat.seatId}
                                className="seat-chip"
                            >
                                {seat.seatRow}{seat.seatCol}
                            </div>
                        ))}

                    </div>

                </div>

                {
                    fnbItems.length>0&&(

                        <>

                            <div className="divider"/>

                            <div className="movie-section">

                                <h4 className="section-title">
                                    Combo bắp nước
                                </h4>

                                <div className="fnb-list">

                                    {
                                        fnbItems.map((item,index)=>(

                                            <div
                                                key={item.productId??index}
                                                className="fnb-item"
                                            >

                                                <span>
                                                    {item.productName}
                                                </span>

                                                <b>
                                                    x{item.quantity}
                                                </b>

                                            </div>

                                        ))
                                    }

                                </div>

                            </div>

                        </>

                    )
                }

            </div>

        </div>

    </div>
);

};

export default MovieInfoCard;