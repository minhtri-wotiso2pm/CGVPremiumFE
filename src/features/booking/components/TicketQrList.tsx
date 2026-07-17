import { type FC, useRef } from "react";
import { QRCode, Spin } from "antd";
import { useTickets } from "../hooks/useTickets";
import type { Ticket } from "../types/ticket.types";
import type { BookingSeat } from "../types/payment.types";
import type { MyBookingSeat } from "../types/ticket.types";
import "./ticket.css";

type SeatLike = BookingSeat | MyBookingSeat;

const seatLabel = (seat?: SeatLike) =>
    seat ? `${seat.seatRow}${String(seat.seatCol).padStart(2, "0")}` : "";

/** Prefer the seat the ticket itself reports (new API), fall back to the
 *  booking's seat list by index (older responses without per-ticket seats). */
const labelForTicket = (t: Ticket, fallback?: SeatLike) =>
    t.seatRow != null && t.seatCol != null
        ? `${t.seatRow}${String(t.seatCol).padStart(2, "0")}`
        : seatLabel(fallback);

// Self-contained inline logo (no external asset) embedded in the QR's
// center — a white rounded badge with the brand wordmark, kept small
// enough (with errorLevel="Q") that the code still scans reliably.
const QR_LOGO = "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <rect width="60" height="60" rx="14" fill="#fff"/>
        <text x="30" y="38" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#E8001C" text-anchor="middle">CV</text>
    </svg>`,
);

const PrinterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const FilmIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
);

const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const TagIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
    </svg>
);

const SeatIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 3h16a1 1 0 011 1v7a4 4 0 01-4 4H7a4 4 0 01-4-4V4a1 1 0 011-1z" />
        <path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" />
    </svg>
);

const InfoRow: FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="tkt-card__row">
        <span className="tkt-card__row-icon">{icon}</span>
        <span>{children}</span>
    </div>
);

interface TicketCardProps {
    ticket: Ticket;
    label: string;
    cinemaName: string;
    roomName: string;
    startTime: string;
    bookingCode: string;
}

/* ── Single ticket card — redesigned to match the E-Ticket mockup:
   cinema/room header, big seat code, QR with an embedded logo, a VALID/
   USED badge, icon-labeled info rows, and a booking-code footer strip. ── */
const TicketCard: FC<TicketCardProps> = ({ ticket, label, cinemaName, roomName, startTime, bookingCode }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isValid = ticket.status.toLowerCase() !== "used";

    const handleDownload = () => {
        const canvas = cardRef.current?.querySelector("canvas");
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `ticket-${bookingCode}-${label || ticket.ticketID}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const dateTime = (() => {
        try {
            const d = new Date(startTime);
            const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
            const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
            return `${time}, ${date}`;
        } catch { return ""; }
    })();

    return (
        <div className="tkt-card-outer">
            <div className="tkt-card" ref={cardRef}>
                <div className="tkt-card__head">
                    <p className="tkt-card__cinema">{cinemaName}</p>
                    {roomName && <p className="tkt-card__room">{roomName}</p>}
                </div>

                {label && <div className="tkt-card__seat">{label}</div>}

                <div className="tkt-card__qr">
                    <QRCode value={ticket.qrCode} size={140} bordered={false} icon={QR_LOGO} iconSize={32} errorLevel="Q" />
                </div>

                <span className={`tkt-card__valid${isValid ? "" : " tkt-card__valid--used"}`}>
                    <CheckCircleIcon />
                    {isValid ? "VALID" : "USED"}
                </span>

                <div className="tkt-card__info">
                    {dateTime && <InfoRow icon={<CalendarIcon />}>{dateTime}</InfoRow>}
                    <InfoRow icon={<FilmIcon />}>CV</InfoRow>
                    <InfoRow icon={<PinIcon />}>{cinemaName}</InfoRow>
                    <InfoRow icon={<TagIcon />}>{bookingCode}</InfoRow>
                    {label && <InfoRow icon={<SeatIcon />}>Seat: {label}</InfoRow>}
                </div>

                <div className="tkt-card__footer">
                    <span className="tkt-card__footer-label">Booking code</span>
                    <span className="tkt-card__footer-code">{bookingCode}</span>
                </div>
            </div>

            <button className="tkt-card__dl" onClick={handleDownload}>Download</button>
        </div>
    );
};

interface Props {
    bookingId: number;
    seats?: SeatLike[];
    cinemaName: string;
    roomName: string;
    startTime: string;
    bookingCode: string;
    /** Render header/print-button for a light background (e.g. staff counter). */
    light?: boolean;
}

const TicketQrList: FC<Props> = ({ bookingId, seats = [], cinemaName, roomName, startTime, bookingCode, light = false }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const { data: tickets = [], isLoading } = useTickets(bookingId);

    const handlePrintAll = () => {
        const canvases = listRef.current?.querySelectorAll("canvas");
        if (!canvases || canvases.length === 0) return;

        const cards = Array.from(canvases).map((cv, i) => ({
            dataUrl: (cv as HTMLCanvasElement).toDataURL("image/png"),
            label: labelForTicket(tickets[i], seats[i]),
            status: tickets[i]?.status ?? "",
        }));

        const body = cards.map((c) => `
            <div class="tk">
                <div class="seat">${c.label}</div>
                <div class="movie">${cinemaName}</div>
                <img src="${c.dataUrl}" width="180" height="180" />
                <div class="code">${bookingCode}</div>
            </div>`).join("");

        const html = `<!doctype html><html><head><title>Tickets — ${bookingCode}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 16px; display: flex; flex-wrap: wrap; gap: 16px; }
                .tk { border: 1px dashed #999; border-radius: 12px; padding: 16px; text-align: center; width: 220px; page-break-inside: avoid; }
                .seat { font-size: 26px; font-weight: 800; }
                .movie { font-size: 13px; color: #555; margin: 4px 0 10px; }
                .code { margin-top: 8px; font-size: 12px; letter-spacing: 1px; color: #333; }
            </style></head>
            <body>${body}
            <script>window.onload=function(){setTimeout(function(){window.print();window.close();},200);};</script>
            </body></html>`;

        const w = window.open("", "_blank", "width=520,height=680");
        if (!w) return;
        w.document.write(html);
        w.document.close();
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                <Spin />
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <p className="tkt-empty">
                Your e-tickets are being generated. Please refresh in a moment or check "My Tickets" later.
            </p>
        );
    }

    return (
        <div className={light ? "tkt--light" : undefined}>
            <div className="tkt-head">
                <p className="tkt-head__title">Your E-Tickets</p>
                <button className="tkt-print-btn" onClick={handlePrintAll}>
                    <PrinterIcon />
                    Print all
                </button>
            </div>
            <div className="tkt-grid" ref={listRef}>
                {tickets.map((t, i) => (
                    <TicketCard
                        key={t.ticketID}
                        ticket={t}
                        label={labelForTicket(t, seats[i])}
                        cinemaName={cinemaName}
                        roomName={roomName}
                        startTime={startTime}
                        bookingCode={bookingCode}
                    />
                ))}
            </div>
        </div>
    );
};

export default TicketQrList;
