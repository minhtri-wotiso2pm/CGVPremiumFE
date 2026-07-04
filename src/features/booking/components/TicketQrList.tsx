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

const PrinterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
    </svg>
);

/* ── Single ticket card ── */
const TicketCard: FC<{
    ticket: Ticket;
    label: string;
    movieTitle: string;
    bookingCode: string;
}> = ({ ticket, label, movieTitle, bookingCode }) => {
    const cardRef = useRef<HTMLDivElement>(null);

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

    const statusClass = ticket.status.toLowerCase() === "used" ? "tkt-card__status--used" : "tkt-card__status--valid";

    return (
        <div className="tkt-card" ref={cardRef}>
            {label && <div className="tkt-card__seat">{label}</div>}
            <p className="tkt-card__movie" title={movieTitle}>{movieTitle}</p>
            <div className="tkt-card__qr">
                <QRCode value={ticket.qrCode} size={140} bordered={false} />
            </div>
            <span className={`tkt-card__status ${statusClass}`}>{ticket.status}</span>
            <button className="tkt-card__dl" onClick={handleDownload}>Download</button>
        </div>
    );
};

interface Props {
    bookingId: number;
    seats?: SeatLike[];
    movieTitle: string;
    bookingCode: string;
}

const TicketQrList: FC<Props> = ({ bookingId, seats = [], movieTitle, bookingCode }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const { data: tickets = [], isLoading } = useTickets(bookingId);

    const handlePrintAll = () => {
        const canvases = listRef.current?.querySelectorAll("canvas");
        if (!canvases || canvases.length === 0) return;

        const cards = Array.from(canvases).map((cv, i) => ({
            dataUrl: (cv as HTMLCanvasElement).toDataURL("image/png"),
            label: seatLabel(seats[i]),
            status: tickets[i]?.status ?? "",
        }));

        const body = cards.map((c) => `
            <div class="tk">
                <div class="seat">${c.label}</div>
                <div class="movie">${movieTitle}</div>
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
        <div>
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
                        label={seatLabel(seats[i])}
                        movieTitle={movieTitle}
                        bookingCode={bookingCode}
                    />
                ))}
            </div>
        </div>
    );
};

export default TicketQrList;
