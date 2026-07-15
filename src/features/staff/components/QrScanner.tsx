import { useEffect, useRef, type FC } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface Props {
    active: boolean;
    onScan: (text: string) => void;
    onError?: (message: string) => void;
}

const ELEMENT_ID = "staff-checkin-qr-reader";

// html5-qrcode's stop() throws synchronously (not a promise rejection) when
// the scanner isn't actually running yet — only call it once state confirms scanning.
const stopIfRunning = (scanner: Html5Qrcode) => {
    if (scanner.getState() === Html5QrcodeScannerState.SCANNING || scanner.getState() === Html5QrcodeScannerState.PAUSED) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
    }
};

const QrScanner: FC<Props> = ({ active, onScan, onError }) => {
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    useEffect(() => {
        if (!active) return;

        const scanner = new Html5Qrcode(ELEMENT_ID);
        let cancelled = false;

        scanner
            .start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => onScanRef.current(decodedText),
                undefined
            )
            .then(() => {
                // Effect was cleaned up before the camera finished starting — stop it now.
                if (cancelled) stopIfRunning(scanner);
            })
            .catch((err) => {
                if (!cancelled) {
                    onError?.(err?.message ?? String(err) ?? "Could not start camera.");
                }
            });

        return () => {
            cancelled = true;
            stopIfRunning(scanner);
        };
    }, [active, onError]);

    if (!active) return null;

    return <div id={ELEMENT_ID} style={{ width: "100%", borderRadius: 8, overflow: "hidden" }} />;
};

export default QrScanner;
