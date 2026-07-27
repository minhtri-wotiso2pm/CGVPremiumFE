import i18n from "@/i18n";
import { code39SvgString } from "@/utils/code39";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";

/** Normalized booking shape the printable bill needs — call sites adapt their
 *  own booking objects (MyBooking, BookingResponse) into this. */
export interface PrintableBooking {
    bookingCode: string;
    movieTitle?: string | null;
    startTime?: string | null;
    cinemaName?: string | null;
    roomName?: string | null;
    seats: { label: string; price?: number }[];
    fnbItems: { name: string; quantity: number; subTotal: number }[];
    subTotal?: number;
    discountAmount?: number;
    finalAmount: number;
    customerName?: string | null;
}

const vnd = (n: number) => formatVnd(Math.round(n));

const fmtTime = (iso?: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return formatDateTime(iso);
};

const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/**
 * Opens a print window with a receipt-style bill: the booking-code Code 39
 * barcode (scannable for F&B pickup / booking lookup) plus the order summary.
 * The per-seat ticket QR codes are printed separately (see TicketQrList).
 */
export function printBill(b: PrintableBooking): void {
    const t = i18n.t;
    const barcode = code39SvgString(b.bookingCode, 68, 2);

    const seatsRows = b.seats.length
        ? `<div class="sec-label">${esc(t("booking:ticketDetail.seats"))}</div>` +
          b.seats
              .map(
                  (s) =>
                      `<div class="row"><span>${esc(t("booking:ticketDetail.seat"))} ${esc(s.label)}</span><span>${s.price != null ? vnd(s.price) : ""}</span></div>`,
              )
              .join("")
        : "";

    const fnbRows = b.fnbItems.length
        ? `<div class="sec-label">${esc(t("booking:fnb.foodBeverage"))}</div>` +
          b.fnbItems
              .map(
                  (f) =>
                      `<div class="row"><span>${f.quantity}× ${esc(f.name)}</span><span>${vnd(f.subTotal)}</span></div>`,
              )
              .join("")
        : "";

    const movieBlock = b.movieTitle
        ? `<div class="movie">${esc(b.movieTitle)}</div>
           <div class="meta">${esc(b.cinemaName ?? "")}${b.roomName ? " · " + esc(b.roomName) : ""}</div>
           ${b.startTime ? `<div class="meta">${esc(fmtTime(b.startTime))}</div>` : ""}`
        : `<div class="meta">${esc(b.cinemaName ?? "")}</div>`;

    const discountRow =
        b.discountAmount && b.discountAmount > 0
            ? `<div class="row"><span>${esc(t("booking:ticketDetail.discount"))}</span><span>−${vnd(b.discountAmount)}</span></div>`
            : "";
    const subtotalRow =
        b.subTotal != null
            ? `<div class="row"><span>${esc(t("booking:ticketDetail.subtotal"))}</span><span>${vnd(b.subTotal)}</span></div>`
            : "";

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t("booking:ticket.billTitle", { code: b.bookingCode }))}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; color: #111; }
        .bill { width: 320px; margin: 0 auto; }
        .brand { text-align: center; font-weight: 800; letter-spacing: 2px; color: #E8001C; font-size: 20px; margin-bottom: 2px; }
        .brand-sub { text-align: center; font-size: 11px; color: #888; margin-bottom: 14px; letter-spacing: 1px; }
        .barcode { text-align: center; padding: 10px 0 4px; }
        .barcode svg { max-width: 100%; height: auto; }
        .code { text-align: center; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 3px; font-size: 15px; margin: 2px 0 14px; }
        .movie { font-size: 15px; font-weight: 700; text-align: center; }
        .meta { font-size: 12px; color: #555; text-align: center; margin-top: 2px; }
        .sec-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 14px 0 6px; border-top: 1px dashed #ccc; padding-top: 10px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
        .total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; margin-top: 10px; border-top: 1px solid #000; padding-top: 10px; }
        .foot { text-align: center; font-size: 11px; color: #888; margin-top: 16px; line-height: 1.5; }
      </style></head>
      <body>
        <div class="bill">
          <div class="brand">CV PREMIUM</div>
          <div class="brand-sub">CINEMA OF EXCELLENCE</div>
          <div class="barcode">${barcode}</div>
          <div class="code">${esc(b.bookingCode)}</div>
          ${movieBlock}
          ${seatsRows}
          ${fnbRows}
          <div class="sec-label" style="border-top:1px dashed #ccc">${esc(t("booking:fnb.stepPayment"))}</div>
          ${subtotalRow}
          ${discountRow}
          <div class="total"><span>${esc(t("booking:seats.total"))}</span><span>${vnd(b.finalAmount)}</span></div>
          ${b.customerName ? `<div class="row" style="margin-top:8px"><span>${esc(t("booking:ticket.customer"))}</span><span>${esc(b.customerName)}</span></div>` : ""}
          <div class="foot">${esc(t("booking:ticket.billFootScan"))}<br/>${esc(t("booking:ticket.billFootKeep"))}</div>
        </div>
        <script>window.onload=function(){setTimeout(function(){window.print();window.close();},250);};</script>
      </body></html>`;

    const w = window.open("", "_blank", "width=420,height=680");
    if (!w) return;
    w.document.write(html);
    w.document.close();
}
