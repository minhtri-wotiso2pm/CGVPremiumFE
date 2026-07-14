import { type FC } from "react";
import { QrCode, ExternalLink } from "lucide-react";

interface Props {
    show: boolean;
    qrCode?: string;
    total: number;
    checkoutUrl?: string;
}

const QRPayment: FC<Props> = ({
    show,
    qrCode,
    total,
    checkoutUrl,
}) => {

    if (!show) return null;

    return (

        <section className="invoice-card">

            <div className="qr-header">

                <div className="qr-icon">

                    <QrCode size={34}/>

                </div>

                <h2>Quét mã để thanh toán</h2>

                <p>

                    Sử dụng ứng dụng ngân hàng hoặc ví điện tử.

                </p>

            </div>

            <div className="qr-box">

                {qrCode && (

                    <img
                        src={qrCode}
                        alt="QR Payment"
                    />

                )}

            </div>

            <div className="qr-price">

                <small>Số tiền cần thanh toán</small>

                <h1>

                    {total.toLocaleString()} ₫

                </h1>

            </div>

            {checkoutUrl && (

                <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="checkout-button"
                >

                    <ExternalLink size={18}/>

                    Mở trang thanh toán

                </a>

            )}

            <button className="paid-button">

                Tôi đã thanh toán

            </button>

        </section>

    );

};

export default QRPayment;