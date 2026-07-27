import { type FC } from "react";
import { useTranslation } from "react-i18next";
import Barcode from "@/components/ui/Barcode";
import { printBill, type PrintableBooking } from "../utils/printBooking";

const PrinterIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9V3.5A1.5 1.5 0 0 1 7.5 2h9A1.5 1.5 0 0 1 18 3.5V9" />
        <path d="M6 18H4.5A1.5 1.5 0 0 1 3 16.5v-4A1.5 1.5 0 0 1 4.5 11h15a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H18" />
        <rect x="6" y="15" width="12" height="6.5" rx="1" />
    </svg>
);

interface Props {
    code: string;
    /** When provided, shows a "Print bill" button that prints a barcode bill. */
    printable?: PrintableBooking;
    /** Surrounding label/button theme. The barcode panel itself is always white. */
    variant?: "dark" | "light";
    /** Small caption under the label. */
    note?: string;
}

/**
 * Booking-code block: a scannable horizontal Code 39 barcode of the booking
 * code (for F&B pickup / booking lookup) plus an optional "Print bill" action.
 * Shared by the customer e-ticket and the staff counter receipt.
 */
const BookingBarcode: FC<Props> = ({ code, printable, variant = "dark", note, }) => {
    const { t } = useTranslation("booking");
    const dark = variant === "dark";
    const labelColor = dark ? "#b09090" : "var(--dash-text-3)";
    const noteColor = dark ? "#8a6a6a" : "var(--dash-text-3)";

    const btnStyle: React.CSSProperties = dark
        ? { border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", color: "#f0e8e8" }
        : { border: "1px solid var(--dash-border-strong)", background: "var(--dash-surface)", color: "var(--dash-text-1)" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: labelColor }}>
                    {t("confirm.bookingCode")}
                </span>
                {printable && (
                    <button
                        type="button"
                        onClick={() => printBill(printable)}
                        style={{
                            ...btnStyle,
                            display: "inline-flex", alignItems: "center", gap: 6,
                            borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        <PrinterIcon />
                        {t("ticket.printBill")}
                    </button>
                )}
            </div>

            <div
                style={{
                    background: "#fff", borderRadius: 12, padding: "14px 18px 10px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    boxShadow: dark ? "0 4px 18px rgba(0,0,0,0.28)" : "0 2px 10px rgba(0,0,0,0.06)",
                    border: dark ? "none" : "1px solid var(--dash-border)",
                }}
            >
                <Barcode value={code} height={60} />
                <span style={{ fontFamily: "'SF Mono', ui-monospace, Menlo, Consolas, monospace", fontSize: 14, fontWeight: 600, letterSpacing: "0.22em", color: "#111", paddingLeft: "0.22em" }}>
                    {code}
                </span>
            </div>

            {note && <span style={{ fontSize: 12, color: noteColor, textAlign: "center" }}>{note}</span>}
        </div>
    );
};

export default BookingBarcode;
