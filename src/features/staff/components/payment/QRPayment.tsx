import { useEffect, useState } from "react";

interface Props {
    show: boolean;
    qrCode?: string;
    total: number;
    checkoutUrl?: string;
}

const QRPayment = ({
    show,
    qrCode,
    total,
    checkoutUrl,
}: Props) => {

    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {

        if (!show) return;

        

        const timer = setInterval(() => {

            setTimeLeft((prev) => {

                if (prev <= 1) {

                    clearInterval(timer);

                    return 0;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [show, qrCode]);

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    if (!show) return null;

    return (

        <div className="payment-qr-card">

            <h2 className="payment-qr-title">
                Quét mã để thanh toán
            </h2>

            <p className="payment-qr-subtitle">
                Sử dụng App ngân hàng hoặc Ví điện tử
            </p>

            <div className="payment-qr-image">

                {qrCode ? (

                    <img
                        src={qrCode}
                        alt="QR Payment"
                    />

                ) : (

                    <div className="payment-qr-placeholder">

                        Đang tạo QR...

                    </div>

                )}

            </div>

            <div className="payment-price">

                {total.toLocaleString()} đ

            </div>

            <div className="payment-countdown">

                ⏰

                {" "}

                {String(minutes).padStart(2, "0")}:

                {String(seconds).padStart(2, "0")}

            </div>

            {timeLeft > 0 ? (

                <div className="payment-status">

                    ⏳ Đang chờ thanh toán...

                </div>

            ) : (

                <div className="payment-status expired">

                    ❌ QR đã hết hạn

                </div>

            )}

            {checkoutUrl && (

                <a

                    href={checkoutUrl}

                    target="_blank"

                    rel="noreferrer"

                    className="payment-open-btn"

                >

                    Mở PayOS

                </a>

            )}

        </div>

    );

};

export default QRPayment;