import { type FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useRooms } from "../hooks/useRooms";
import type { Room, RoomModalType } from "../types/room.types";
import {
    ROOM_PAGE_SIZE,
    ROOM_TYPE_FILTER_OPTIONS,
    ROOM_STATUS_FILTER_OPTIONS,
} from "../constants/room.constants";
import RoomModal from "../components/RoomModal";
import DeleteRoomModal from "../components/DeleteRoomModal";

const { Search } = Input;

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const GridIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);
const RefreshIcon = ({ spin }: { spin: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s", transform: spin ? "rotate(360deg)" : "rotate(0deg)" }}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
);

/* ── Stat pill (mirrors CinemaManagementPage) ── */
const StatPill: FC<{ label: string; value: number; accent?: boolean; muted?: boolean }> = ({
    label, value, accent, muted,
}) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px", borderRadius: 20,
        background: accent ? "rgba(232,0,28,0.06)" : muted ? "rgba(0,0,0,0.03)" : "rgba(34,197,94,0.06)",
        border: `1px solid ${accent ? "rgba(232,0,28,0.14)" : muted ? "var(--dash-border)" : "rgba(34,197,94,0.18)"}`,
    }}>
        <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: accent ? "#E8001C" : muted ? "var(--dash-text-3)" : "#22c55e",
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
            {value}
        </span>
        <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
    </div>
);

const RoomManagementPage: FC = () => {
    const navigate = useNavigate();
    // Ensures redux user.cinema is populated for managers landing here directly.
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const cinemaId = user?.cinema?.cinemaId ?? null;

    const { data: allRooms = [], isLoading, isError, refetch, isFetching } = useRooms();

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [modalType, setModalType] = useState<RoomModalType | null>(null);
    const [selected, setSelected] = useState<Room | null>(null);

    // Defensive scope: only rooms of the manager's own cinema.
    const rooms = useMemo(
        () => (cinemaId ? allRooms.filter((r) => r.cinemaId === cinemaId) : allRooms),
        [allRooms, cinemaId],
    );

    const stats = useMemo(() => ({
        total: rooms.length,
        active: rooms.filter((r) => r.status === "ACTIVE").length,
        inactive: rooms.filter((r) => r.status !== "ACTIVE").length,
    }), [rooms]);

    const filtered = useMemo(() => {
        let result = rooms;
        const q = search.trim().toLowerCase();
        if (q) result = result.filter((r) => r.name.toLowerCase().includes(q));
        if (type) result = result.filter((r) => r.type === type);
        if (status) result = result.filter((r) => r.status === status);
        return result;
    }, [rooms, search, type, status]);

    const openModal = (t: RoomModalType, room?: Room) => {
        setSelected(room ?? null);
        setModalType(t);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const columns: ColumnsType<Room> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            ),
        },
        {
            title: "Room",
            dataIndex: "name",
            key: "name",
            render: (name: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{name}</span>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 110,
            render: (t: string) => (
                <span className="dash-badge" style={{ background: "rgba(232,0,28,0.06)", color: "var(--dash-crimson)", border: "1px solid rgba(232,0,28,0.14)" }}>{t}</span>
            ),
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            key: "capacity",
            width: 100,
            render: (c: number) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{c} seats</span>
            ),
            responsive: ["md"],
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 110,
            render: (s: string) => (
                <span className={`dash-badge ${s === "ACTIVE" ? "dash-badge--active" : "dash-badge--inactive"}`}>
                    {s === "ACTIVE" ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 130,
            align: "right",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Manage seats">
                        <button className="dash-icon-btn" aria-label="Manage seats" onClick={() => navigate(`/manager/rooms/${record.roomId}/seats`)}>
                            <GridIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Edit room">
                        <button className="dash-icon-btn" aria-label="Edit room" onClick={() => openModal("edit", record)}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete room">
                        <button className="dash-icon-btn" aria-label="Delete room" onClick={() => openModal("delete", record)} style={{ color: "#E8001C" }}>
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Room Management</h1>
                        <p className="dash-page-sub">
                            Manage screening rooms{user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}.
                        </p>
                    </div>
                    {cinemaId && !isLoading && rooms.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total" value={stats.total} muted />
                            <StatPill label="Active" value={stats.active} />
                            <StatPill label="Inactive" value={stats.inactive} accent />
                        </div>
                    )}
                </div>
            </div>

            {!cinemaId && !isLoading && (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            )}

            {cinemaId && (
                <>
                    <div className="dash-toolbar">
                        <div className="dash-toolbar__left">
                            <Search placeholder="Search by room name..." allowClear value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
                            <Select value={type} onChange={setType} options={[...ROOM_TYPE_FILTER_OPTIONS]} style={{ width: 130 }} />
                            <Select value={status} onChange={setStatus} options={[...ROOM_STATUS_FILTER_OPTIONS]} style={{ width: 136 }} />
                        </div>
                        <div className="dash-toolbar__right">
                            <Tooltip title="Refresh data">
                                <button className="dash-icon-btn" onClick={() => refetch()} aria-label="Refresh" disabled={isFetching}>
                                    <RefreshIcon spin={isFetching} />
                                </button>
                            </Tooltip>
                            <Button
                                type="primary"
                                icon={<PlusIcon />}
                                onClick={() => openModal("create")}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                Add Room
                            </Button>
                        </div>
                    </div>

                    {isError ? (
                        <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--dash-text-1)", fontWeight: 600 }}>Failed to load rooms</p>
                            <Button onClick={() => refetch()}>Retry</Button>
                        </div>
                    ) : (
                        <div className="dash-card" style={{ overflow: "hidden" }}>
                            <Table<Room>
                                dataSource={filtered}
                                columns={columns}
                                rowKey="roomId"
                                loading={isLoading}
                                pagination={{
                                    pageSize: ROOM_PAGE_SIZE,
                                    hideOnSinglePage: true,
                                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} rooms`,
                                    style: { padding: "12px 16px", marginBottom: 0 },
                                }}
                                scroll={{ x: 640 }}
                                rowHoverable
                            />
                        </div>
                    )}
                </>
            )}

            {cinemaId && (
                <>
                    <RoomModal
                        mode={modalType === "edit" ? "edit" : "create"}
                        room={selected}
                        cinemaId={cinemaId}
                        open={modalType === "create" || modalType === "edit"}
                        onClose={closeModal}
                    />
                    <DeleteRoomModal room={selected} open={modalType === "delete"} onClose={closeModal} />
                </>
            )}
        </div>
    );
};

export default RoomManagementPage;
