import { type FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, InputNumber, Select, Spin, Tooltip, Modal } from "antd";
import {
    useRoomSeats,
    useGenerateSeats,
    useBulkUpdateSeats,
    useBulkDeleteSeats,
} from "../hooks/useRoomSeats";
import { useSeatTypes } from "../hooks/useSeatTypes";
import { useRooms, useUpdateRoom } from "../hooks/useRooms";
import {
    SEAT_CONFIG_STATUS_OPTIONS,
    MAX_SEAT_ROWS,
    MAX_SEAT_COLUMNS,
} from "../constants/room.constants";
import type { ConfigSeat, SeatConfigStatus, SeatSelector } from "../types/room.types";
import "../components/room-layout.css";

const SEAT_COLORS = ["#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#22c55e", "#6366f1"];

const SeatManagementPage: FC = () => {
    const navigate = useNavigate();
    const { roomId: roomIdStr } = useParams<{ roomId: string }>();
    const roomId = Number(roomIdStr);

    const { data: seats = [], isLoading, isError, refetch } = useRoomSeats(roomId);
    const { data: seatTypes = [] } = useSeatTypes();
    const { data: rooms = [] } = useRooms();
    const { mutate: updateRoom, isPending: settingInactive } = useUpdateRoom();
    const { mutate: generateSeats, isPending: generating } = useGenerateSeats(roomId);
    const { mutate: bulkUpdate, isPending: bulkUpdating } = useBulkUpdateSeats(roomId);
    const { mutate: bulkDelete, isPending: bulkDeleting } = useBulkDeleteSeats(roomId);

    const room = rooms.find((r) => r.roomId === roomId);
    const isRoomActive = room?.status === "ACTIVE";
    const locked = isRoomActive || generating || bulkUpdating || bulkDeleting;

    const seatTypeColor = useMemo(() => {
        const map = new Map<number, string>();
        seatTypes.forEach((st, i) => map.set(st.seatTypeId, SEAT_COLORS[i % SEAT_COLORS.length]));
        return map;
    }, [seatTypes]);
    const seatTypeName = useMemo(() => {
        const map = new Map<number, string>();
        seatTypes.forEach((st) => map.set(st.seatTypeId, st.typeName));
        return map;
    }, [seatTypes]);

    /* ── Grid derivation — read-only view of the seats that already exist.
       New positions are only added via the Generate form, never by
       clicking an empty cell (no more free-paint /layout endpoint). ── */
    const { rowLabels, maxCol, seatMap } = useMemo(() => {
        const map = new Map<string, Map<number, ConfigSeat>>();
        let maxColumn = 0;
        for (const s of seats) {
            if (!map.has(s.rowLabel)) map.set(s.rowLabel, new Map());
            map.get(s.rowLabel)!.set(s.seatNumber, s);
            if (s.seatNumber > maxColumn) maxColumn = s.seatNumber;
        }
        return { rowLabels: Array.from(map.keys()).sort(), maxCol: maxColumn, seatMap: map };
    }, [seats]);

    /* ── Selection — only meaningful while the room is inactive. Three
       independent modes, matching the backend's selector modes (confirmed
       via its validation error "Selector mode must be IDS, ROWS, or COLS"):
       clicking a seat selects by ID, clicking a row/column label selects
       the whole row/column. All three combine into the selectors sent to
       the bulk endpoints. ── */
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());

    const toggleSelect = (seatId: number) => {
        if (locked) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(seatId)) next.delete(seatId);
            else next.add(seatId);
            return next;
        });
    };
    const toggleRow = (rowLabel: string) => {
        if (locked) return;
        setSelectedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rowLabel)) next.delete(rowLabel);
            else next.add(rowLabel);
            return next;
        });
    };
    const toggleCol = (col: number) => {
        if (locked) return;
        setSelectedCols((prev) => {
            const next = new Set(prev);
            if (next.has(col)) next.delete(col);
            else next.add(col);
            return next;
        });
    };
    const clearSelection = () => {
        setSelected(new Set());
        setSelectedRows(new Set());
        setSelectedCols(new Set());
    };
    const hasSelection = selected.size > 0 || selectedRows.size > 0 || selectedCols.size > 0;

    const selectors = useMemo(() => {
        const list: SeatSelector[] = [];
        if (selected.size > 0) list.push({ mode: "IDS", target: Array.from(selected).map(String) });
        if (selectedRows.size > 0) list.push({ mode: "ROWS", target: Array.from(selectedRows) });
        if (selectedCols.size > 0) list.push({ mode: "COLS", target: Array.from(selectedCols).map(String) });
        return list;
    }, [selected, selectedRows, selectedCols]);

    const selectionLabel = useMemo(() => {
        const parts: string[] = [];
        if (selected.size > 0) parts.push(`${selected.size} seat${selected.size > 1 ? "s" : ""}`);
        if (selectedRows.size > 0) parts.push(`${selectedRows.size} row${selectedRows.size > 1 ? "s" : ""}`);
        if (selectedCols.size > 0) parts.push(`${selectedCols.size} column${selectedCols.size > 1 ? "s" : ""}`);
        return parts.join(", ");
    }, [selected, selectedRows, selectedCols]);

    /* ── Generate form ── */
    const [genRows, setGenRows] = useState(1);
    const [genColumn, setGenColumn] = useState(10);
    const [genSeatTypeId, setGenSeatTypeId] = useState<number | undefined>(undefined);
    const [genStatus, setGenStatus] = useState<SeatConfigStatus>("active");

    const genSeatTypeIdResolved = genSeatTypeId ?? seatTypes[0]?.seatTypeId;
    const canGenerate = !locked && genRows >= 1 && genColumn >= 1 && !!genSeatTypeIdResolved;

    const handleGenerate = () => {
        if (!canGenerate || !genSeatTypeIdResolved) return;
        generateSeats({
            rows: genRows,
            column: genColumn,
            seatTypeId: genSeatTypeIdResolved,
            status: genStatus,
        });
    };

    /* ── Bulk actions on the current selection ── */
    const [bulkSeatTypeId, setBulkSeatTypeId] = useState<number | undefined>(undefined);
    const [bulkStatus, setBulkStatus] = useState<SeatConfigStatus | undefined>(undefined);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const applyBulkSeatType = () => {
        if (!bulkSeatTypeId) return;
        bulkUpdate({ selectors, update: { seatTypeId: bulkSeatTypeId } }, { onSuccess: clearSelection });
    };
    const applyBulkStatus = () => {
        if (!bulkStatus) return;
        bulkUpdate({ selectors, update: { status: bulkStatus } }, { onSuccess: clearSelection });
    };
    const applyBulkGap = (isGap: boolean) => {
        // Converting a gap back into a real seat requires both a seat type
        // and a status — the backend rejects isGap:false without either
        // ("SeatTypeId is required..." / "Status is required..."). Marking
        // as a gap has no such requirement. Reuse the "Change Seat Type" /
        // "Change Status" selects above for this.
        if (!isGap && (!bulkSeatTypeId || !bulkStatus)) return;
        bulkUpdate(
            {
                selectors,
                update: isGap ? { isGap } : { isGap, seatTypeId: bulkSeatTypeId, status: bulkStatus },
            },
            { onSuccess: clearSelection },
        );
    };
    const confirmDelete = () => {
        bulkDelete({ selectors }, {
            onSuccess: () => {
                clearSelection();
                setDeleteConfirmOpen(false);
            },
        });
    };

    const handleSetInactive = () => {
        if (!room) return;
        updateRoom({
            roomId: room.roomId,
            payload: {
                cinemaId: room.cinemaId,
                name: room.name,
                type: room.type,
                status: "INACTIVE",
                description: room.description,
            },
        });
    };

    /* ── Render ── */
    if (isLoading) {
        return (
            <div className="dash-fade-in" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load seats</p>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button className="dash-icon-btn" aria-label="Back to rooms" onClick={() => navigate("/manager/rooms")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="dash-page-title">Manage Seats{room ? ` — ${room.name}` : ""}</h1>
                        <p className="dash-page-sub">View existing seats and generate or bulk-edit seat ranges.</p>
                    </div>
                </div>
            </div>

            {isRoomActive && (
                <div className="rle-warning">
                    <span>
                        This room is currently <strong>Active</strong>. Seats can only be added, edited or removed
                        while the room is <strong>Inactive</strong> — set it inactive first to make changes.
                    </span>
                    <Button
                        onClick={handleSetInactive}
                        loading={settingInactive}
                        style={{ background: "#E8001C", borderColor: "#E8001C", color: "#fff", flexShrink: 0 }}
                    >
                        Set Room to Inactive
                    </Button>
                </div>
            )}

            {seatTypes.length === 0 && (
                <div className="dash-card" style={{ padding: "16px 20px", marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        You have no seat types yet. Create seat types first so you can assign them when generating seats.
                    </p>
                </div>
            )}

            <div className="rle-layout">
                {/* ── Grid view (read-only, click to select) ── */}
                <div className="dash-card" style={{ padding: "18px 20px" }}>
                    <div className="rle-wrap">
                        <div className="rle-screen"><span className="rle-screen__label">Screen</span></div>

                        {rowLabels.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--dash-text-3)" }}>
                                No seats yet — use "Generate Seats" to create the first row.
                            </div>
                        ) : (
                            <div className="rle-stage">
                                <div className="rle-collabels">
                                    {Array.from({ length: maxCol }, (_, c) => {
                                        const col = c + 1;
                                        return (
                                            <span
                                                key={c}
                                                className={`rle-collabel${selectedCols.has(col) ? " rle-collabel--selected" : ""}`}
                                                role="button"
                                                tabIndex={0}
                                                aria-pressed={selectedCols.has(col)}
                                                onClick={() => toggleCol(col)}
                                                title={`Select entire column ${col}`}
                                            >
                                                {col}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="rle-grid">
                                    {rowLabels.map((rowLabel) => (
                                        <div key={rowLabel} className="rle-row">
                                            <span
                                                className={`rle-rowlabel${selectedRows.has(rowLabel) ? " rle-rowlabel--selected" : ""}`}
                                                role="button"
                                                tabIndex={0}
                                                aria-pressed={selectedRows.has(rowLabel)}
                                                onClick={() => toggleRow(rowLabel)}
                                                title={`Select entire row ${rowLabel}`}
                                            >
                                                {rowLabel}
                                            </span>
                                            {Array.from({ length: maxCol }, (_, i) => {
                                                const col = i + 1;
                                                const seat = seatMap.get(rowLabel)?.get(col);
                                                if (!seat) {
                                                    return <div key={col} className="rle-cell rle-cell--empty" aria-hidden="true" />;
                                                }
                                                const isSelected = selected.has(seat.seatId) || selectedRows.has(rowLabel) || selectedCols.has(col);
                                                const color = seatTypeColor.get(seat.seatTypeId) ?? "#3b82f6";
                                                const cls = [
                                                    "rle-cell",
                                                    seat.isGap ? "rle-cell--walkway" : "",
                                                    seat.status === "inactive" ? "rle-cell--inactive" : "",
                                                    isSelected ? "rle-cell--selected" : "",
                                                ].filter(Boolean).join(" ");
                                                return (
                                                    <div
                                                        key={col}
                                                        className={cls}
                                                        style={!seat.isGap ? { background: `${color}2e`, borderColor: color } : undefined}
                                                        title={`${seat.seatCode} · ${seatTypeName.get(seat.seatTypeId) ?? seat.type}${seat.isGap ? " (gap)" : ""}${seat.status === "inactive" ? " (inactive)" : ""}`}
                                                        onClick={() => toggleSelect(seat.seatId)}
                                                        role="button"
                                                        aria-pressed={isSelected}
                                                    >
                                                        {seat.isGap ? "" : col}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rle-legend">
                            {seatTypes.map((st) => (
                                <span key={st.seatTypeId} className="rle-legend__item">
                                    <span className="rle-swatch" style={{ background: seatTypeColor.get(st.seatTypeId) }} />
                                    {st.typeName}
                                </span>
                            ))}
                            <Tooltip title="Gap positions are kept as a placeholder (e.g. an aisle) and are never bookable.">
                                <span className="rle-legend__item">
                                    <span className="rle-swatch" style={{ background: "transparent", border: "1.5px dashed rgba(0,0,0,0.25)" }} />
                                    Gap
                                </span>
                            </Tooltip>
                            <Tooltip title="Inactive seats are kept but hidden from booking.">
                                <span className="rle-legend__item">
                                    <span className="rle-swatch" style={{ background: "#d1d5db" }} />
                                    Inactive
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* ── Side panel: Generate + Bulk actions ── */}
                <div className="rle-sidebar">
                    <div className="dash-card" style={{ padding: "18px 20px" }}>
                        <p className="rle-panel-title">Generate Seats</p>
                        <div className="rle-form">
                            <div style={{ display: "flex", gap: 10 }}>
                                <label className="rle-field" style={{ flex: 1 }}>
                                    <span>Rows</span>
                                    <InputNumber min={1} max={MAX_SEAT_ROWS} value={genRows} onChange={(v) => setGenRows(Number(v) || 1)} style={{ width: "100%" }} disabled={locked} />
                                </label>
                                <label className="rle-field" style={{ flex: 1 }}>
                                    <span>Columns</span>
                                    <InputNumber min={1} max={MAX_SEAT_COLUMNS} value={genColumn} onChange={(v) => setGenColumn(Number(v) || 1)} style={{ width: "100%" }} disabled={locked} />
                                </label>
                            </div>
                            <label className="rle-field">
                                <span>Seat Type</span>
                                <Select
                                    value={genSeatTypeIdResolved}
                                    onChange={setGenSeatTypeId}
                                    options={seatTypes.map((st) => ({ value: st.seatTypeId, label: st.typeName }))}
                                    placeholder="Select seat type"
                                    disabled={locked || seatTypes.length === 0}
                                />
                            </label>
                            <label className="rle-field">
                                <span>Status</span>
                                <Select
                                    value={genStatus}
                                    onChange={setGenStatus}
                                    options={[...SEAT_CONFIG_STATUS_OPTIONS]}
                                    disabled={locked}
                                />
                            </label>
                            <Button
                                type="primary"
                                block
                                onClick={handleGenerate}
                                loading={generating}
                                disabled={!canGenerate}
                                style={{ background: "#E8001C", borderColor: "#E8001C" }}
                            >
                                Generate
                            </Button>
                            <p className="rle-hint">Max {MAX_SEAT_ROWS} rows / {MAX_SEAT_COLUMNS} columns per room.</p>
                        </div>
                    </div>

                    {hasSelection && (
                        <div className="dash-card" style={{ padding: "18px 20px" }}>
                            <p className="rle-panel-title">{selectionLabel} selected</p>
                            <div className="rle-form">
                                <label className="rle-field">
                                    <span>Change Seat Type</span>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Select
                                            value={bulkSeatTypeId}
                                            onChange={setBulkSeatTypeId}
                                            options={seatTypes.map((st) => ({ value: st.seatTypeId, label: st.typeName }))}
                                            placeholder="Select type"
                                            style={{ flex: 1 }}
                                            disabled={locked}
                                        />
                                        <Button onClick={applyBulkSeatType} disabled={locked || !bulkSeatTypeId} loading={bulkUpdating}>Apply</Button>
                                    </div>
                                </label>
                                <label className="rle-field">
                                    <span>Change Status</span>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Select
                                            value={bulkStatus}
                                            onChange={setBulkStatus}
                                            options={[...SEAT_CONFIG_STATUS_OPTIONS]}
                                            placeholder="Select status"
                                            style={{ flex: 1 }}
                                            disabled={locked}
                                        />
                                        <Button onClick={applyBulkStatus} disabled={locked || !bulkStatus} loading={bulkUpdating}>Apply</Button>
                                    </div>
                                </label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Button onClick={() => applyBulkGap(true)} disabled={locked} loading={bulkUpdating} style={{ flex: 1 }}>Mark as Gap</Button>
                                    <Button onClick={() => applyBulkGap(false)} disabled={locked || !bulkSeatTypeId || !bulkStatus} loading={bulkUpdating} style={{ flex: 1 }}>Unmark Gap</Button>
                                </div>
                                <p className="rle-hint">Unmark Gap needs both a seat type and a status selected above — converting a gap into a real seat requires them.</p>
                                <Button danger block onClick={() => setDeleteConfirmOpen(true)} disabled={locked}>
                                    Delete Selected
                                </Button>
                                <Button block onClick={clearSelection} disabled={bulkUpdating || bulkDeleting}>
                                    Clear Selection
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                open={deleteConfirmOpen}
                onCancel={() => setDeleteConfirmOpen(false)}
                onOk={confirmDelete}
                okText="Delete"
                okButtonProps={{ danger: true, loading: bulkDeleting }}
                title="Delete Selected Seats"
            >
                <p>Are you sure you want to delete the selected {selectionLabel}? This cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default SeatManagementPage;
