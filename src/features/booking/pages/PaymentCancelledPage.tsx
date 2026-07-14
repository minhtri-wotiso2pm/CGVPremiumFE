import { type FC } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../components/payment.css";

/** PayOS's configured cancelUrl lands here (/customer/booking) whenever the
 *  customer backs out of or cancels a PayOS checkout — the seats/booking
 *  created for that attempt are left as-is server-side (unpaid/cancelled),
 *  this is purely an informational screen. */
const PaymentCancelledPage: FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get("bookingId");

    return (
        <div className="cgv-confirm-page">
            <div className="cgv-confirm-inner">
                <div className="cgv-confirm-hero">
                    <div className="cgv-confirm-icon cgv-confirm-icon--cancelled" aria-hidden="true">✕</div>
                    <p className="cgv-confirm-title">Thanh toán đã bị hủy</p>
                    <p className="cgv-confirm-subtitle">
                        Bạn đã hủy giao dịch trên PayOS, vé chưa được thanh toán.
                    </p>
                </div>

                <div className="cgv-confirm-actions">
                    {bookingId && (
                        <button
                            className="cgv-confirm-invoice-btn"
                            onClick={() => navigate("/customer/profile/tickets", { replace: true })}
                        >
                            Xem vé của tôi
                        </button>
                    )}
                    <button
                        className="cgv-confirm-home-btn"
                        onClick={() => navigate("/customer", { replace: true })}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelledPage;
