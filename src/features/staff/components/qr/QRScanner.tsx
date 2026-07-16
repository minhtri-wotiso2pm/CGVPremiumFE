import { useEffect, type FC } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
    onScanSuccess: (text: string) => void;
}

const QRScanner: FC<Props> = ({ onScanSuccess }) => {

    useEffect(() => {

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
            },
            false
        );

        scanner.render(

            (decodedText) => {

                onScanSuccess(decodedText);

            },

            () => {}

        );

        return () => {

            scanner.clear();

        };

    }, [onScanSuccess]);

    return <div id="reader" className="camera-box"></div>;

};

export default QRScanner;