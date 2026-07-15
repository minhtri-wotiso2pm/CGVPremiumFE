import { useRef, useState } from "react";
import { Alert, Button, Collapse, Input, Skeleton, Table, Tooltip } from "antd";
import type { InputRef } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import QrScanner from "../components/QrScanner";
import {
    getCheckInErrorInfo,
    useCheckInHistory,
    useCheckInLookup,
    usePerformCheckIn,
} from "../hooks/useCheckIn";
import { playScanFeedback } from "../utils/scanFeedback";
import type {
    CheckInHistoryRecord,
    CheckInHistorySeat,
    CheckInLookupResult,
    CheckInSeat,
} from "../types/checkin.types";
import styles from "./CheckInPage.module.css";

const { Search } = Input;

const fmtDateTime = (iso: string | null | undefined) =>
    iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—";
const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const HISTORY_PAGE_SIZE = 10;

// A booking in one of these statuses must never be let in, regardless of
// its payment status — those two fields can disagree (e.g. paid, then
// refunded after the fact) and bookingStatus is the one that actually
// reflects whether the ticket is still valid.
const isBookingVoided = (bookingStatus: string) => /cancel|refund/i.test(bookingStatus);

export default function CheckInPage() {
    const user = useAppSelector((state) => state.auth.user);
    const searchRef = useRef<InputRef>(null);

    const [qrInput, setQrInput] = useState("");
    const [scanning, setScanning] = useState(false);
    const [lookupError, setLookupError] = useState<{ message: string; kind: "network" | "business" } | null>(null);
    const [actionError, setActionError] = useState<{ message: string; kind: "network" | "business" } | null>(null);
    const [result, setResult] = useState<CheckInLookupResult | null>(null);
    const [page, setPage] = useState(1);

    const lookupMutation = useCheckInLookup();
    const checkInMutation = usePerformCheckIn();
    const historyQuery = useCheckInHistory({ page, pageSize: HISTORY_PAGE_SIZE });

    const resetForNextTicket = () => {
        setQrInput("");
        setResult(null);
        setLookupError(null);
        setActionError(null);
        searchRef.current?.focus();
    };

    const runLookup = (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;
        setLookupError(null);
        setActionError(null);
        lookupMutation.mutate(trimmed, {
            onSuccess: (res) => {
                setResult(res.data);
                playScanFeedback("success");
            },
            onError: (err) => {
                setResult(null);
                setLookupError(getCheckInErrorInfo(err, "Could not find booking for this QR code."));
                playScanFeedback("error");
            },
        });
    };

    const handleScan = (text: string) => {
        setQrInput(text);
        runLookup(text);
    };

    const handleCheckIn = () => {
        const trimmed = qrInput.trim();
        if (!trimmed) return;
        setActionError(null);
        checkInMutation.mutate(trimmed, {
            onSuccess: () => {
                playScanFeedback("success");
                // Give the staff a beat to see the confirmation, then clear
                // the form so it's immediately ready for the next customer.
                setTimeout(resetForNextTicket, 1400);
            },
            onError: (err) => {
                playScanFeedback("error");
                setActionError(getCheckInErrorInfo(err, "Check-in failed."));
            },
        });
    };

    const allCheckedIn = result ? result.seats.every((s) => s.isCheckedIn) : false;
    const bookingVoided = result ? isBookingVoided(result.bookingStatus) : false;
    const cinemaMismatch = !!(result && user?.cinema?.cinemaName
        && result.cinema.name.trim().toLowerCase() !== user.cinema.cinemaName.trim().toLowerCase());
    const showtimeEnded = result ? dayjs(result.showtime.endTime).isBefore(dayjs()) : false;

    const seatColumns: ColumnsType<CheckInSeat> = [
        {
            title: "Seat",
            key: "seat",
            render: (_, s) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>
                    {s.row}{s.column}
                </span>
            ),
        },
        { title: "Type", dataIndex: "seatType", key: "seatType" },
        {
            title: "Price",
            dataIndex: "ticketPrice",
            key: "ticketPrice",
            render: fmtVnd,
        },
        {
            title: "Status",
            key: "status",
            render: (_, s) => (
                <span className={`dash-badge ${s.isCheckedIn ? "dash-badge--active" : "dash-badge--pending"}`}>
                    {s.isCheckedIn ? "Checked in" : "Not checked in"}
                </span>
            ),
        },
    ];

    const seatDetailColumns: ColumnsType<CheckInHistorySeat> = [
        {
            title: "Seat",
            dataIndex: "seatCode",
            key: "seatCode",
            render: (v: string) => <span style={{ fontWeight: 600, color: "var(--dash-text-1)" }}>{v}</span>,
        },
        { title: "Type", dataIndex: "seatType", key: "seatType" },
        { title: "Price", dataIndex: "ticketPrice", key: "ticketPrice", render: fmtVnd },
        { title: "Checked in at", dataIndex: "checkedInAt", key: "checkedInAt", render: fmtDateTime },
    ];

    const historyColumns: ColumnsType<CheckInHistoryRecord> = [
        {
            title: "Booking",
            dataIndex: "bookingCode",
            key: "bookingCode",
            render: (v: string) => <span style={{ fontWeight: 600, color: "var(--dash-text-1)" }}>{v}</span>,
        },
        { title: "Customer", dataIndex: "customerName", key: "customerName" },
        { title: "Movie", dataIndex: "movieTitle", key: "movieTitle", responsive: ["md"] },
        {
            title: "Showtime",
            dataIndex: "showtimeStart",
            key: "showtimeStart",
            render: fmtDateTime,
            responsive: ["md"],
        },
        { title: "Checked in at", dataIndex: "checkedInAt", key: "checkedInAt", render: fmtDateTime },
        { title: "Staff", dataIndex: "staffName", key: "staffName", responsive: ["lg"] },
        { title: "Seats", dataIndex: "seatCount", key: "seatCount", width: 80 },
        {
            title: "Total",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: fmtVnd,
            responsive: ["lg"],
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header">
                <div>
                    <h1 className="dash-page-title">Check-in</h1>
                    <p className="dash-page-sub">
                        Scan or enter a ticket QR code to look up and check in a booking.
                    </p>
                </div>
            </div>

            <div className={styles.stickyTop}>
                <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <Search
                            ref={searchRef}
                            placeholder="Enter QR code..."
                            value={qrInput}
                            onChange={(e) => setQrInput(e.target.value)}
                            onSearch={runLookup}
                            loading={lookupMutation.isPending}
                            enterButton="Lookup"
                            style={{ maxWidth: 320 }}
                            autoFocus
                        />
                        <Button onClick={() => setScanning((v) => !v)}>
                            {scanning ? "Stop camera" : "Scan with camera"}
                        </Button>
                    </div>

                    {scanning && (
                        <div style={{ maxWidth: 360, marginTop: 16 }}>
                            <QrScanner
                                active={scanning}
                                onScan={handleScan}
                                onError={(m) => setLookupError({ message: m, kind: "business" })}
                            />
                            <p style={{ fontSize: 12, color: "var(--dash-text-3)", margin: "8px 0 0" }}>
                                Camera stays on — scan the next ticket as soon as this one is done.
                            </p>
                        </div>
                    )}
                </div>

                {lookupMutation.isPending && !result && (
                    <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                        <Skeleton active title={false} paragraph={{ rows: 3 }} />
                    </div>
                )}

                {lookupError && (
                    <Alert
                        type={lookupError.kind === "network" ? "warning" : "error"}
                        message={lookupError.message}
                        showIcon
                        closable
                        style={{ marginBottom: 20 }}
                        onClose={() => setLookupError(null)}
                    />
                )}

                {result && (
                    <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text-1)" }}>
                                    {result.bookingCode} · {result.customerName}
                                </div>
                                <div style={{ fontSize: 13, color: "var(--dash-text-2)", marginTop: 2 }}>
                                    {result.movie.title} ({result.movie.rating}, {result.movie.duration} min) · {result.cinema.name} · {result.room.name}
                                </div>
                                <div style={{ fontSize: 13, color: "var(--dash-text-2)" }}>
                                    {fmtDateTime(result.showtime.startTime)} – {fmtDateTime(result.showtime.endTime)}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                                <span className={`dash-badge ${result.paymentStatus === "completed" ? "dash-badge--active" : "dash-badge--pending"}`}>
                                    Payment: {result.paymentStatus}
                                </span>
                                <span className={`dash-badge ${result.checkedIn ? "dash-badge--active" : "dash-badge--inactive"}`}>
                                    {result.checkedIn ? "All checked in" : "Not checked in"}
                                </span>
                            </div>
                        </div>

                        {bookingVoided && (
                            <Alert
                                type="error"
                                showIcon
                                message="This booking is cancelled or refunded — do not admit this customer."
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {!bookingVoided && (cinemaMismatch || showtimeEnded) && (
                            <Alert
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                                message={
                                    cinemaMismatch && showtimeEnded
                                        ? "This ticket is for a different cinema and its showtime has already ended."
                                        : cinemaMismatch
                                            ? "This ticket is for a different cinema than the one you're checking in at."
                                            : "This showtime has already ended."
                                }
                            />
                        )}

                        <Table
                            rowKey={(s) => `${s.row}${s.column}`}
                            columns={seatColumns}
                            dataSource={result.seats}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: 16 }}
                        />

                        {result.products.length > 0 && (
                            <div style={{ fontSize: 13, color: "var(--dash-text-2)", marginBottom: 16 }}>
                                Products: {result.products.map((p) => `${p.name} x${p.quantity}`).join(", ")}
                            </div>
                        )}

                        {actionError && (
                            <Alert
                                type={actionError.kind === "network" ? "warning" : "error"}
                                message={actionError.message}
                                showIcon
                                closable
                                style={{ marginBottom: 16 }}
                                onClose={() => setActionError(null)}
                            />
                        )}

                        <Tooltip title={allCheckedIn ? "This ticket is already checked in" : ""}>
                            <Button
                                type="primary"
                                onClick={handleCheckIn}
                                loading={checkInMutation.isPending}
                                disabled={allCheckedIn || bookingVoided}
                            >
                                Check in
                            </Button>
                        </Tooltip>
                    </div>
                )}
            </div>

            <Collapse
                defaultActiveKey={[]}
                items={[
                    {
                        key: "history",
                        label: (
                            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                                Check-in history
                            </span>
                        ),
                        children: (
                            <Table
                                rowKey="bookingId"
                                columns={historyColumns}
                                dataSource={historyQuery.data?.data.records ?? []}
                                loading={historyQuery.isLoading}
                                expandable={{
                                    expandedRowRender: (record) => (
                                        <Table
                                            rowKey="seatCode"
                                            columns={seatDetailColumns}
                                            dataSource={record.checkedInSeats}
                                            pagination={false}
                                            size="small"
                                        />
                                    ),
                                    rowExpandable: (record) => record.checkedInSeats.length > 0,
                                }}
                                pagination={{
                                    current: page,
                                    pageSize: HISTORY_PAGE_SIZE,
                                    total: historyQuery.data?.data.totalCount ?? 0,
                                    onChange: setPage,
                                    showSizeChanger: false,
                                }}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}
