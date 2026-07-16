import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CheckInSuccessPage: FC = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    return (
        <div className="payment-success-page">

            <div className="payment-success-card">

                <h1>✅ Check-in thành công</h1>

                <p>Khách đã vào rạp.</p>

                <div className="success-item">
                    <span>Mã QR</span>
                    <strong>{state?.qrCode}</strong>
                </div>

                <button
                    className="payment-home-btn"
                    onClick={() => navigate("/staff")}
                >
                    Về trang chủ
                </button>

            </div>

        </div>
    );
};

export default CheckInSuccessPage;