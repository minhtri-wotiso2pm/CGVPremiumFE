import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Ticket, Home } from "lucide-react";
import "../components/payment/payment-success.css";
import "../../booking/components/payment.css";
import type { BookingResponse } from "@/features/booking/types/payment.types";
import { ScanLine } from "lucide-react";
const PaymentSuccessPage: FC = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const booking = (state as { booking: BookingResponse })?.booking;
    if (!booking) {
        return (
            <div className="payment-success-page">
                <h2>Không tìm thấy thông tin thanh toán.</h2>

                <button
                    className="payment-success-btn"
                    onClick={() => navigate("/staff")}
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="payment-success-page">

            <div className="payment-success-card">

                <div className="payment-success-icon">
                    <CheckCircle2 size={90} />
                </div>

                <h1>Thanh toán thành công</h1>

                <p className="payment-success-desc">
                    Vé đã được tạo thành công và sẵn sàng để check-in.
                </p>

                <div className="payment-success-info">

                    <div className="success-item">
                        <span>Mã Booking</span>
                        <strong>{booking.bookingCode}</strong>
                    </div>

                    <div className="success-item">
                        <span>Tên phim</span>
                        <strong>{booking.movieTitle}</strong>
                    </div>

                    <div className="success-item">
                        <span>Rạp</span>
                        <strong>{booking.cinemaName}</strong>
                    </div>

                    <div className="success-item">
                        <span>Phòng</span>
                        <strong>{booking.roomName}</strong>
                    </div>

                    <div className="success-item">
                        <span>Suất chiếu</span>
                        <strong>{booking.startTime}</strong>
                    </div>

                    <div className="success-item">
                        <span>Tổng tiền</span>
                        <strong className="price">
                            {booking.finalAmount.toLocaleString()} đ
                        </strong>
                    </div>

                </div>

                <div className="payment-success-actions">

                    <button
                        className="payment-ticket-btn"
                        onClick={() => navigate("/staff/counter-booking")}
                    >
                        <Ticket size={18} />
                        Đặt vé mới
                    </button>

                    <button
                        className="payment-home-btn"
                        onClick={() => navigate("/staff")}
                    >
                        <Home size={18} />
                        Trang chủ
                    </button>

                    <button
                        className="payment-checkin-btn"
                        onClick={() =>
                            navigate("/staff/qr-checkin", {
                                state: {
                                    bookingId: booking.bookingID,
                                    bookingCode: booking.bookingCode,
                                },
                            })
                        }
                    >
                        <ScanLine size={18} />
                        QR Check-in
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PaymentSuccessPage;