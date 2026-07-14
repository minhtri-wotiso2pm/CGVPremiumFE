import type { FC } from "react";
import "./payment.css";

interface Props {
    movieTitle: string;
    moviePoster?: string;
    cinemaName?: string;
    roomName?: string;
    startTime?: string;
    selectedSeats?: {
        seatNumber: string;
    }[];
}

const PaymentMovieCard: FC<Props> = ({
    movieTitle,
    moviePoster,
    cinemaName,
    roomName,
    startTime,
    selectedSeats = [],
}) => {
    return (
        <div className="payment-card movie-card">

            <img
                className="movie-poster"
                src={moviePoster}
                alt={movieTitle}
            />

            <div className="movie-info">

                <h2>{movieTitle}</h2>

                <div className="movie-detail">

                    <span className="label">
                        Rạp
                    </span>

                    <span>
                        {cinemaName}
                    </span>

                </div>

                <div className="movie-detail">

                    <span className="label">
                        Phòng
                    </span>

                    <span>
                        {roomName}
                    </span>

                </div>

                <div className="movie-detail">

                    <span className="label">
                        Suất chiếu: 
                    </span>

                    <span>
                        {startTime}
                    </span>

                </div>

                <div className="movie-detail">

                    <span className="label">
                        Ghế
                    </span>

                    <div className="seat-list">

                        {selectedSeats.map((seat) => (
                            <span
                                key={seat.seatNumber}
                                className="seat-tag"
                            >
                                {seat.seatNumber}
                            </span>
                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default PaymentMovieCard;