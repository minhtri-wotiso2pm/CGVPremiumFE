import { useState } from "react";
import { Alert, Button, Input, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import QrScanner from "../components/QrScanner";
import {
    getCheckInErrorMessage,
    useCheckInHistory,
    useCheckInLookup,
    usePerformCheckIn,
} from "../hooks/useCheckIn";
import type {
    CheckInHistoryRecord,
    CheckInLookupResult,
    CheckInSeat,
} from "../types/checkin.types";

const { Search } = Input;

const fmtDateTime = (iso: string | null | undefined) =>
    iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—";
const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const HISTORY_PAGE_SIZE = 10;

export default function CheckInPage() {
    const [qrInput, setQrInput] = useState("");
    const [scanning, setScanning] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [result, setResult] = useState<CheckInLookupResult | null>(null);
    const [page, setPage] = useState(1);

    const lookupMutation = useCheckInLookup();
    const checkInMutation = usePerformCheckIn();
    const historyQuery = useCheckInHistory({ page, pageSize: HISTORY_PAGE_SIZE });

    const runLookup = (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;
        setLookupError(null);
        setActionError(null);
        lookupMutation.mutate(trimmed, {
            onSuccess: (res) => setResult(res.data),
            onError: (err) => {
                setResult(null);
                setLookupError(getCheckInErrorMessage(err, "Could not find booking for this QR code."));
            },
        });
    };

    const handleScan = (text: string) => {
        setScanning(false);
        setQrInput(text);
        runLookup(text);
    };

    const handleCheckIn = () => {
        const trimmed = qrInput.trim();
        if (!trimmed) return;
        setActionError(null);
        checkInMutation.mutate(trimmed, {
            onSuccess: () => runLookup(trimmed),
            onError: (err) => setActionError(getCheckInErrorMessage(err, "Check-in failed.")),
        });
    };

    const allCheckedIn = result ? result.seats.every((s) => s.isCheckedIn) : false;

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

            <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Search
                        placeholder="Enter QR code..."
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onSearch={runLookup}
                        loading={lookupMutation.isPending}
                        enterButton="Lookup"
                        style={{ maxWidth: 320 }}
                    />
                    <Button onClick={() => setScanning((v) => !v)}>
                        {scanning ? "Stop camera" : "Scan with camera"}
                    </Button>
                </div>

                {scanning && (
                    <div style={{ maxWidth: 360, marginTop: 16 }}>
                        <QrScanner active={scanning} onScan={handleScan} onError={(m) => setLookupError(m)} />
                    </div>
                )}
            </div>

            {lookupError && (
                <Alert
                    type="error"
                    message={lookupError}
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
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span className={`dash-badge ${result.paymentStatus === "completed" ? "dash-badge--active" : "dash-badge--pending"}`}>
                                Payment: {result.paymentStatus}
                            </span>
                            <span className={`dash-badge ${result.checkedIn ? "dash-badge--active" : "dash-badge--inactive"}`}>
                                {result.checkedIn ? "All checked in" : "Not checked in"}
                            </span>
                        </div>
                    </div>

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
                            type="error"
                            message={actionError}
                            showIcon
                            closable
                            style={{ marginBottom: 16 }}
                            onClose={() => setActionError(null)}
                        />
                    )}

                    <Tooltip title={allCheckedIn ? "All tickets in this booking are already checked in" : ""}>
                        <Button
                            type="primary"
                            onClick={handleCheckIn}
                            loading={checkInMutation.isPending}
                            disabled={allCheckedIn}
                        >
                            Check in
                        </Button>
                    </Tooltip>
                </div>
            )}

            <div className="dash-card">
                <div className="dash-toolbar">
                    <div className="dash-toolbar__left">
                        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                            Check-in history
                        </h2>
                    </div>
                </div>
                <Table
                    rowKey="bookingId"
                    columns={historyColumns}
                    dataSource={historyQuery.data?.data.records ?? []}
                    loading={historyQuery.isLoading}
                    pagination={{
                        current: page,
                        pageSize: HISTORY_PAGE_SIZE,
                        total: historyQuery.data?.data.totalCount ?? 0,
                        onChange: setPage,
                        showSizeChanger: false,
                    }}
                />
            </div>
        </div>
    );
}
