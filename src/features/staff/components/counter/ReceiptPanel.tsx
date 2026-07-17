import { type FC, useEffect, useRef } from "react";
import { Button } from "antd";
import dayjs from "dayjs";
import { formatPrice } from "@/features/booking/utils/seat.utils";
import TicketQrList from "@/features/booking/components/TicketQrList";
import BookingBarcode from "@/features/booking/components/BookingBarcode";
import type { PrintableBooking } from "@/features/booking/utils/printBooking";
import type { CounterReceipt } from "../../types/counter.types";
import { CheckIcon, FnbOnlyIcon } from "./icons";
import styles from "./counter.module.css";

const METHOD_LABEL: Record<CounterReceipt["paymentMethod"], string> = {
    cash: "Cash",
    wallet: "Member wallet",
    payos: "PayOS",
};

const fmtTime = (iso: string) => {
    const d = dayjs(iso);
    return d.isValid() ? d.format("ddd, DD/MM/YYYY · HH:mm") : iso;
};

interface Props {
    receipt: CounterReceipt;
    onNewOrder: () => void;
}

const ReceiptPanel: FC<Props> = ({ receipt, onNewOrder }) => {
    const { booking } = receipt;
    const newOrderRef = useRef<HTMLButtonElement>(null);

    // Auto-focus "New order" so staff can start the next customer with one keypress.
    useEffect(() => { newOrderRef.current?.focus(); }, []);

    const hasTicket = !!booking.movieTitle && booking.seats.length > 0;
    const discount = booking.discountAmount ?? 0;

    const printable: PrintableBooking = {
        bookingCode: booking.bookingCode,
        movieTitle: booking.movieTitle,
        startTime: booking.startTime,
        cinemaName: booking.cinemaName,
        roomName: booking.roomName,
        seats: booking.seats.map((s) => ({ label: `${s.seatRow}${s.seatCol}`, price: s.ticketPrice })),
        fnbItems: booking.fnbItems.map((f) => ({ name: f.itemName, quantity: f.quantity, subTotal: f.subTotal })),
        subTotal: booking.subTotal,
        discountAmount: booking.discountAmount,
        finalAmount: booking.finalAmount,
        customerName: receipt.memberName,
    };

    return (
        <div className="dash-card">
            <div className={styles.receipt}>
                <span className={styles.receiptCheck}><CheckIcon size={34} /></span>
                <h2 className={styles.receiptTitle}>Payment complete</h2>
                <p className={styles.receiptSub}>Booking confirmed and paid.</p>

                <div style={{ width: "100%", maxWidth: 420, margin: "6px 0 4px" }}>
                    <BookingBarcode
                        code={booking.bookingCode}
                        printable={printable}
                        variant="light"
                        note="Scan at the F&B counter for pickup"
                    />
                </div>

                {receipt.hasFnb && (
                    <div className={styles.receiptFnbNote}>
                        <FnbOnlyIcon size={18} />
                        Remember to hand over the food &amp; drinks
                    </div>
                )}

                {/* ── Booking details ── */}
                <div className={styles.receiptDetails}>
                    {hasTicket && (
                        <>
                            <p className={styles.receiptMovieTitle}>{booking.movieTitle}</p>
                            <p className={styles.receiptMeta}>
                                {booking.cinemaName}{booking.roomName ? ` · ${booking.roomName}` : ""}
                            </p>
                            {booking.startTime && <p className={styles.receiptMeta}>{fmtTime(booking.startTime)}</p>}
                            <div className={styles.receiptSeats}>
                                {booking.seats.map((s) => (
                                    <span key={s.seatID} className={styles.railChip}>{s.seatRow}{s.seatCol}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {booking.fnbItems.length > 0 && (
                        <>
                            <p className={styles.receiptSectionLabel}>Food &amp; Beverage</p>
                            {booking.fnbItems.map((f, i) => (
                                <div key={`${f.itemName}-${i}`} className={styles.railLine} style={{ marginBottom: 6 }}>
                                    <span className={styles.railLineName}>{f.quantity}× {f.itemName}</span>
                                    <span className={styles.railLineVal}>{formatPrice(f.subTotal)}</span>
                                </div>
                            ))}
                        </>
                    )}

                    <div className={styles.receiptDetailDivider} />

                    <div className={styles.railLine} style={{ marginBottom: 6 }}>
                        <span className={styles.railLineName}>Subtotal</span>
                        <span className={styles.railLineVal}>{formatPrice(booking.subTotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className={styles.railLine} style={{ marginBottom: 6 }}>
                            <span className={styles.railLineName}>
                                Discount{booking.voucherApplied ? ` · ${booking.voucherApplied.voucherCode}` : ""}
                            </span>
                            <span className={styles.railLineVal} style={{ color: "#147a40" }}>−{formatPrice(discount)}</span>
                        </div>
                    )}
                    <div className={styles.railLine}>
                        <span className={styles.railLineName} style={{ fontWeight: 700, color: "var(--dash-text-1)" }}>Total paid</span>
                        <span className={styles.railLineVal} style={{ fontSize: 16 }}>{formatPrice(booking.finalAmount)}</span>
                    </div>

                    <div className={styles.receiptDetailDivider} />

                    <div className={styles.railLine} style={{ marginBottom: 6 }}>
                        <span className={styles.railLineName}>Customer</span>
                        <span className={styles.railLineVal}>{receipt.memberName ?? "Guest"}</span>
                    </div>
                    <div className={styles.railLine} style={{ marginBottom: receipt.paymentMethod === "cash" ? 6 : 0 }}>
                        <span className={styles.railLineName}>Payment</span>
                        <span className={styles.railLineVal}>{METHOD_LABEL[receipt.paymentMethod]}</span>
                    </div>
                    {receipt.paymentMethod === "cash" && receipt.cashReceived != null && (
                        <>
                            <div className={styles.railLine} style={{ marginBottom: 6 }}>
                                <span className={styles.railLineName}>Cash received</span>
                                <span className={styles.railLineVal}>{formatPrice(receipt.cashReceived)}</span>
                            </div>
                            <div className={styles.railLine}>
                                <span className={styles.railLineName}>Change</span>
                                <span className={styles.railLineVal} style={{ color: "#147a40" }}>{formatPrice(receipt.change ?? 0)}</span>
                            </div>
                        </>
                    )}
                </div>

                {hasTicket && (
                    <div style={{ width: "100%", maxWidth: 640, marginTop: 24, textAlign: "left" }}>
                        <TicketQrList
                            light
                            bookingId={booking.bookingID}
                            seats={booking.seats}
                            cinemaName={booking.cinemaName}
                            roomName={booking.roomName}
                            startTime={booking.startTime}
                            bookingCode={booking.bookingCode}
                        />
                    </div>
                )}

                <div className={styles.receiptActions}>
                    <Button ref={newOrderRef} type="primary" size="large" onClick={onNewOrder}>
                        New order
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPanel;
