import { useEffect, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import { checkInApi } from "@/services/api/checkin.service";
const QrCheckInPage: FC = () => {
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement>(null);

    const [result, setResult] = useState("");

    const controlsRef = useRef<Awaited<
        ReturnType<BrowserQRCodeReader["decodeFromVideoDevice"]>
    > | null>(null);

    useEffect(() => {
        const codeReader = new BrowserQRCodeReader();

        const startCamera = async () => {
            try {
                const devices =
                    await BrowserQRCodeReader.listVideoInputDevices();

                if (devices.length === 0) {
                    alert("Không tìm thấy camera.");
                    return;
                }

                if (!videoRef.current) return;

                controlsRef.current =
                    await codeReader.decodeFromVideoDevice(
                        devices[0].deviceId,
                        videoRef.current,
                        async (result) => {
    if (!result) return;

    const qrCode = result.getText();

    setResult(qrCode);

    try {
        const res = await checkInApi(qrCode);


console.log("API Response:", res);
controlsRef.current?.stop();

navigate("/staff/checkin-success", {
    state: res.data,
});
    } catch (error) {
        console.error(error);
        alert("Check-in thất bại!");
    }
}
                    );
            } catch (err) {
                console.error(err);
            }
        };

        startCamera();

        return () => {
            controlsRef.current?.stop();
        };
    }, []);

    return (
        <div className="checkin-page">
            <h1>QR Check-in</h1>

            <video
                ref={videoRef}
                className="camera-box"
                muted
                playsInline
            />

            <p className="scan-text">
                Đưa mã QR vào khung hình
            </p>

            {result && (
                <div className="qr-result">
                    {result}
                </div>
            )}

            <button
                className="payment-home-btn"
                onClick={() => navigate("/staff")}
            >
                Quay lại
            </button>
        </div>
    );
};

export default QrCheckInPage;