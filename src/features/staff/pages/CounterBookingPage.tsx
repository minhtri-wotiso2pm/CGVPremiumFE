import { useMemo, useState } from "react";
import { Button } from "antd";
import { useAppSelector } from "@/store/hooks";
import { useCounterBooking } from "../hooks/useCounterBooking";
import CounterStepper from "../components/counter/CounterStepper";
import ModeSelect from "../components/counter/ModeSelect";
import OrderRail from "../components/counter/OrderRail";
import CounterFnbGrid from "../components/counter/CounterFnbGrid";
import ShowtimePicker from "../components/counter/ShowtimePicker";
import CounterSeatMap from "../components/counter/CounterSeatMap";
import CustomerStep from "../components/counter/CustomerStep";
import PaymentStep from "../components/counter/PaymentStep";
import ReceiptPanel from "../components/counter/ReceiptPanel";
import type { CounterReceipt } from "../types/counter.types";
import styles from "../components/counter/counter.module.css";

export default function CounterBookingPage() {
    const cb = useCounterBooking();
    const { state } = cb;
    const staffCinema = useAppSelector((s) => s.auth.user?.cinema);
    const staffCinemaId = staffCinema?.cinemaId;
    const [receipt, setReceipt] = useState<CounterReceipt | null>(null);

    // F&B is sold from the showtime's cinema for ticket orders, or the staff's
    // own cinema for F&B-only orders.
    const cinemaId = state.showtime?.cinemaId ?? staffCinemaId;

    const fnbItems = useMemo(
        () => cb.fnbLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
        [cb.fnbLines],
    );

    const handlePaid = (r: CounterReceipt) => {
        // Seats are now booked (not just held). finalize() drops the hold
        // without releasing it and clears the saved in-progress order so a
        // refresh on the receipt won't restore a paid order.
        cb.finalize();
        setReceipt(r);
    };

    const handleNewOrder = () => {
        setReceipt(null);
        cb.reset();
    };

    /* ── Receipt (terminal) ── */
    if (receipt) {
        return (
            <div className="dash-fade-in">
                <div className="dash-page-header">
                    <div>
                        <h1 className="dash-page-title">Counter Sales</h1>
                        <p className="dash-page-sub">Order complete.</p>
                    </div>
                </div>
                <ReceiptPanel receipt={receipt} onNewOrder={handleNewOrder} />
            </div>
        );
    }

    /* ── Mode chooser (pre-stepper) ── */
    if (state.step === "mode") {
        return (
            <div className="dash-fade-in">
                <div className="dash-page-header">
                    <div>
                        <h1 className="dash-page-title">Counter Sales</h1>
                        <p className="dash-page-sub">Create a booking at the counter. Choose what the customer wants to buy.</p>
                    </div>
                </div>
                <ModeSelect onSelect={cb.selectMode} />
            </div>
        );
    }

    const canNext = cb.isStepComplete(state.step);
    const isPayment = state.step === "payment";
    // The showtime, seats, and payment steps provide their own primary action
    // (selecting a showtime / holding seats / paying), so the rail's generic
    // "Continue" would be redundant there.
    const stepOwnsCta = state.step === "seats" || state.step === "showtime" || isPayment;

    const renderStepBody = () => {
        switch (state.step) {
            case "showtime":
                return (
                    <ShowtimePicker
                        cinemaId={staffCinemaId}
                        cinemaName={staffCinema?.cinemaName ?? "your cinema"}
                        onSelect={(st) => { cb.setShowtime(st); cb.goNext(); }}
                    />
                );
            case "seats":
                return state.showtime ? (
                    <CounterSeatMap
                        showtimeId={state.showtime.showtimeId}
                        selectedSeats={state.selectedSeats}
                        onSeatsChange={cb.setSeats}
                        onContinue={(hold) => { cb.setHold(hold); cb.goNext(); }}
                    />
                ) : (
                    <Placeholder title="Select a showtime first" note="Go back and pick a showtime." />
                );
            case "fnb":
                return (
                    <div className="dash-card" style={{ padding: 24 }}>
                        <div className={styles.stepHeadRow}>
                            <div>
                                <h2 className={styles.stepHeadTitle}>Food &amp; Beverage</h2>
                                <p className={styles.stepHeadSub}>
                                    {state.mode === "FNB_ONLY" ? "Add at least one item to continue." : "Optional — add items or skip."}
                                </p>
                            </div>
                        </div>
                        <CounterFnbGrid cinemaId={cinemaId} fnb={state.fnb} onAdd={cb.addFnb} onDec={cb.decFnb} />
                    </div>
                );
            case "customer":
                return (
                    <CustomerStep
                        customer={state.customer}
                        voucherCode={state.voucherCode}
                        onSetGuest={cb.setGuest}
                        onSetMember={cb.setMember}
                        onSetVoucher={cb.setVoucher}
                    />
                );
            case "payment":
                return (
                    <PaymentStep
                        customerId={state.customer.member?.userID ?? null}
                        member={state.customer.member}
                        showtimeId={state.showtime?.showtimeId ?? null}
                        seatIds={cb.seatIds}
                        fnbItems={fnbItems}
                        voucherCode={state.voucherCode}
                        onPaid={handlePaid}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header">
                <div>
                    <h1 className="dash-page-title">Counter Sales</h1>
                    <p className="dash-page-sub">Complete each step, then take payment.</p>
                </div>
                <Button danger onClick={handleNewOrder}>Cancel order</Button>
            </div>

            <CounterStepper
                steps={cb.steps}
                current={state.step}
                isStepComplete={cb.isStepComplete}
                canAccessStep={cb.canAccessStep}
                onStepClick={cb.goToStep}
            />

            <div className={styles.layout}>
                <div className={`${styles.main} ${styles.stepBody}`}>{renderStepBody()}</div>

                <aside className={styles.rail}>
                    <OrderRail
                        mode={state.mode}
                        showtime={state.showtime}
                        selectedSeats={state.selectedSeats}
                        fnbLines={cb.fnbLines}
                        member={state.customer.member}
                        customerResolved={state.customer.resolved}
                        voucherCode={state.voucherCode}
                        seatsSubtotal={cb.seatsSubtotal}
                        fnbSubtotal={cb.fnbSubtotal}
                        estimatedTotal={cb.estimatedTotal}
                    >
                        {!stepOwnsCta && (
                            <Button type="primary" size="large" block disabled={!canNext} onClick={cb.goNext}>
                                Continue
                            </Button>
                        )}
                        <Button size="large" block onClick={cb.goBack}>Back</Button>
                    </OrderRail>
                </aside>
            </div>
        </div>
    );
}

function Placeholder({ title, note }: { title: string; note: string }) {
    return (
        <div className="dash-card" style={{ padding: 32 }}>
            <div className={styles.stepHeadRow}>
                <div>
                    <h2 className={styles.stepHeadTitle}>{title}</h2>
                    <p className={styles.stepHeadSub}>{note}</p>
                </div>
            </div>
        </div>
    );
}
