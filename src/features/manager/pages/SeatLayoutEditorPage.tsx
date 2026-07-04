import { type FC, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, InputNumber, Spin, Switch, Tooltip } from "antd";
import { useRoomLayout, useUpdateRoomLayout } from "../hooks/useRoomLayout";
import { useSeatTypes } from "../hooks/useSeatTypes";
import { useRooms } from "../hooks/useRooms";
import type { RoomLayout, SeatType, UpdateRoomLayoutPayload } from "../types/room.types";
import "../components/room-layout.css";

/* ── Cell model ── */
type SeatStatus = "ACTIVE" | "INACTIVE";
interface Cell {
    seatTypeId: number | null; // null → walkway
    status: SeatStatus;
}
type Grid = Cell[][];

const MAX_ROWS = 26;
const MAX_COLS = 40;
const SEAT_COLORS = ["#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#22c55e", "#6366f1"];

const letterToIndex = (label: string) => (label ? label.toUpperCase().charCodeAt(0) - 65 : 0);
const indexToLetter = (i: number) => String.fromCharCode(65 + i);
const walkway = (): Cell => ({ seatTypeId: null, status: "ACTIVE" });

function buildGrid(layout: RoomLayout): { rows: number; cols: number; grid: Grid } {
    const rows = Math.min(Math.max(layout.totalRows || 1, 1), MAX_ROWS);
    const cols = Math.min(Math.max(layout.totalCols || 1, 1), MAX_COLS);
    const grid: Grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, walkway),
    );
    for (const seat of layout.seats) {
        const r = letterToIndex(seat.rowLabel);
        const c = (seat.seatNumber || 0) - 1;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c] = {
                seatTypeId: seat.seatTypeId,
                status: String(seat.status).toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
            };
        }
    }
    return { rows, cols, grid };
}

function resizeGrid(old: Grid, rows: number, cols: number): Grid {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => old[r]?.[c] ?? walkway()),
    );
}

/* ── Tool ── */
type Tool = { kind: "walkway" } | { kind: "seat"; seatTypeId: number };

const SeatLayoutEditorPage: FC = () => {
    const navigate = useNavigate();
    const { roomId: roomIdStr } = useParams<{ roomId: string }>();
    const roomId = Number(roomIdStr);

    const { data: layout, isLoading, isError, refetch } = useRoomLayout(roomId);
    const { data: seatTypes = [] } = useSeatTypes();
    const { data: rooms = [] } = useRooms();
    const { mutate: saveLayout, isPending: saving } = useUpdateRoomLayout(roomId);

    const room = rooms.find((r) => r.roomId === roomId);

    /* Grid state — synced from server via "adjust state during render" (no effect). */
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);
    const [grid, setGrid] = useState<Grid>([]);
    const [syncedFrom, setSyncedFrom] = useState<RoomLayout | null>(null);
    const [dirty, setDirty] = useState(false);

    if (layout && layout !== syncedFrom) {
        const built = buildGrid(layout);
        setSyncedFrom(layout);
        setRows(built.rows);
        setCols(built.cols);
        setGrid(built.grid);
        setDirty(false);
    }

    /* Tools */
    const seatTypeColor = useMemo(() => {
        const map = new Map<number, string>();
        seatTypes.forEach((st, i) => map.set(st.seatTypeId, SEAT_COLORS[i % SEAT_COLORS.length]));
        return map;
    }, [seatTypes]);

    // null → not yet chosen by the user; fall back to the first seat type
    // once loaded (derived, so no effect/extra render needed).
    const [pickedTool, setPickedTool] = useState<Tool | null>(null);
    const tool: Tool = pickedTool
        ?? (seatTypes.length > 0 ? { kind: "seat", seatTypeId: seatTypes[0].seatTypeId } : { kind: "walkway" });
    const setTool = setPickedTool;

    const [paintInactive, setPaintInactive] = useState(false);
    const [painting, setPainting] = useState(false);

    // Stop painting when the mouse is released anywhere.
    useEffect(() => {
        const up = () => setPainting(false);
        window.addEventListener("mouseup", up);
        return () => window.removeEventListener("mouseup", up);
    }, []);

    const applyTool = (r: number, c: number) => {
        setGrid((prev) => {
            const next = prev.map((row) => row.slice());
            next[r][c] = tool.kind === "walkway"
                ? walkway()
                : { seatTypeId: tool.seatTypeId, status: paintInactive ? "INACTIVE" : "ACTIVE" };
            return next;
        });
        setDirty(true);
    };

    const handleResize = (nextRows: number, nextCols: number) => {
        const rr = Math.min(Math.max(nextRows, 1), MAX_ROWS);
        const cc = Math.min(Math.max(nextCols, 1), MAX_COLS);
        setGrid((prev) => resizeGrid(prev, rr, cc));
        setRows(rr);
        setCols(cc);
        setDirty(true);
    };

    /* Summary counts */
    const counts = useMemo(() => {
        let seats = 0;
        const perType = new Map<number, number>();
        for (const row of grid) {
            for (const cell of row) {
                if (cell.seatTypeId != null) {
                    seats += 1;
                    perType.set(cell.seatTypeId, (perType.get(cell.seatTypeId) ?? 0) + 1);
                }
            }
        }
        return { seats, perType };
    }, [grid]);

    const handleSave = () => {
        const seats: UpdateRoomLayoutPayload["seats"] = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                const rowLabel = indexToLetter(r);
                const colIndex = c + 1;
                if (cell.seatTypeId == null) {
                    seats.push({ rowLabel, colIndex, seatName: null, seatTypeId: null, status: null, isWalkway: true });
                } else {
                    seats.push({
                        rowLabel,
                        colIndex,
                        seatName: `${rowLabel}${colIndex}`,
                        seatTypeId: cell.seatTypeId,
                        status: cell.status.toLowerCase(),
                        isWalkway: false,
                    });
                }
            }
        }
        saveLayout({ totalRows: rows, totalCols: cols, seats }, { onSuccess: () => setDirty(false) });
    };

    const handleReset = () => {
        if (!layout) return;
        const built = buildGrid(layout);
        setRows(built.rows);
        setCols(built.cols);
        setGrid(built.grid);
        setDirty(false);
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
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load layout</p>
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
                        <h1 className="dash-page-title">Seat Layout{room ? ` — ${room.name}` : ""}</h1>
                        <p className="dash-page-sub">Design the seat map. Click or drag to paint seats and walkways.</p>
                    </div>
                </div>
            </div>

            {seatTypes.length === 0 && (
                <div className="dash-card" style={{ padding: "16px 20px", marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        You have no seat types yet. Create seat types first so you can assign them to seats.
                    </p>
                </div>
            )}

            <div className="dash-card" style={{ padding: "18px 20px" }}>
                <div className="rle-wrap">
                    {/* Controls row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--dash-text-2)", fontWeight: 600 }}>
                                Rows
                                <InputNumber min={1} max={MAX_ROWS} value={rows} onChange={(v) => handleResize(Number(v) || 1, cols)} style={{ width: 68 }} />
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--dash-text-2)", fontWeight: 600 }}>
                                Cols
                                <InputNumber min={1} max={MAX_COLS} value={cols} onChange={(v) => handleResize(rows, Number(v) || 1)} style={{ width: 68 }} />
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--dash-text-2)", fontWeight: 600 }}>
                                <Switch size="small" checked={paintInactive} onChange={setPaintInactive} />
                                Paint as blocked
                            </label>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Button onClick={handleReset} disabled={!dirty || saving}>Reset</Button>
                            <Button type="primary" onClick={handleSave} loading={saving} disabled={!dirty} style={{ background: "#E8001C", borderColor: "#E8001C" }}>
                                Save Layout
                            </Button>
                        </div>
                    </div>

                    {/* Palette */}
                    <div className="rle-palette">
                        <button
                            className={`rle-tool${tool.kind === "walkway" ? " rle-tool--active" : ""}`}
                            onClick={() => setTool({ kind: "walkway" })}
                        >
                            <span className="rle-swatch" style={{ background: "repeating-linear-gradient(45deg,#eee,#eee 3px,#fff 3px,#fff 6px)" }} />
                            Walkway / Erase
                        </button>
                        {seatTypes.map((st: SeatType) => (
                            <button
                                key={st.seatTypeId}
                                className={`rle-tool${tool.kind === "seat" && tool.seatTypeId === st.seatTypeId ? " rle-tool--active" : ""}`}
                                onClick={() => setTool({ kind: "seat", seatTypeId: st.seatTypeId })}
                            >
                                <span className="rle-swatch" style={{ background: seatTypeColor.get(st.seatTypeId) }} />
                                {st.typeName}
                                {st.extraPrice > 0 && (
                                    <span style={{ fontSize: 10.5, color: "var(--dash-text-3)", fontWeight: 500 }}>
                                        +{st.extraPrice.toLocaleString("vi-VN")}₫
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Stage */}
                    <div className="rle-stage">
                        <div className="rle-screen"><span className="rle-screen__label">Screen</span></div>

                        {cols > 0 && (
                            <div className="rle-collabels">
                                {Array.from({ length: cols }, (_, c) => (
                                    <span key={c} className="rle-collabel">{c + 1}</span>
                                ))}
                            </div>
                        )}

                        <div className="rle-grid">
                            {grid.map((row, r) => (
                                <div key={r} className="rle-row">
                                    <span className="rle-rowlabel">{indexToLetter(r)}</span>
                                    {row.map((cell, c) => {
                                        const isSeat = cell.seatTypeId != null;
                                        const color = isSeat ? seatTypeColor.get(cell.seatTypeId as number) ?? "#3b82f6" : undefined;
                                        return (
                                            <div
                                                key={c}
                                                className={`rle-cell${!isSeat ? " rle-cell--walkway" : ""}${isSeat && cell.status === "INACTIVE" ? " rle-cell--inactive" : ""}`}
                                                style={isSeat ? { background: `${color}2e`, borderColor: color } : undefined}
                                                title={isSeat ? `${indexToLetter(r)}${c + 1}${cell.status === "INACTIVE" ? " (blocked)" : ""}` : "Walkway"}
                                                onMouseDown={() => { setPainting(true); applyTool(r, c); }}
                                                onMouseEnter={() => { if (painting) applyTool(r, c); }}
                                            >
                                                {isSeat ? c + 1 : ""}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend + summary */}
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                        <div className="rle-legend">
                            {seatTypes.map((st) => (
                                <span key={st.seatTypeId} className="rle-legend__item">
                                    <span className="rle-swatch" style={{ background: seatTypeColor.get(st.seatTypeId) }} />
                                    {st.typeName} · {counts.perType.get(st.seatTypeId) ?? 0}
                                </span>
                            ))}
                            <Tooltip title="Blocked seats are kept in the layout but cannot be booked.">
                                <span className="rle-legend__item">
                                    <span className="rle-swatch" style={{ background: "#d1d5db" }} />
                                    Blocked
                                </span>
                            </Tooltip>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text-1)" }}>
                            Total seats: {counts.seats}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLayoutEditorPage;
