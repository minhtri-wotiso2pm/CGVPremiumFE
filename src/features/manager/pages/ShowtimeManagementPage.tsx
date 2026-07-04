import { type FC, useMemo, useState } from "react";
import { Button, DatePicker, Select, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useManagerShowtimes } from "../hooks/useManagerShowtimes";
import type { ManagerShowtime, ShowtimeModalType } from "../types/showtime-mgmt.types";
import {
    SHOWTIME_PAGE_SIZE,
    SHOWTIME_STATUS_FILTER_OPTIONS,
    SHOWTIME_STATUS_BADGE,
} from "../constants/showtime-mgmt.constants";
import ShowtimeModal from "../components/ShowtimeModal";
import DeleteShowtimeModal from "../components/DeleteShowtimeModal";

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
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);

const fmtDate = (iso: string) => (iso ? dayjs(iso.slice(0, 19)).format("DD/MM/YYYY") : "—");
const fmtTime = (iso: string) => (iso ? dayjs(iso.slice(0, 19)).format("HH:mm") : "");
const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const ShowtimeManagementPage: FC = () => {
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const cinemaId = user?.cinema?.cinemaId ?? null;

    const [date, setDate] = useState<Dayjs | null>(null);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [modalType, setModalType] = useState<ShowtimeModalType | null>(null);
    const [selected, setSelected] = useState<ManagerShowtime | null>(null);

    const params = useMemo(
        () => ({
            cinemaId: cinemaId ?? undefined,
            date: date ? date.format("YYYY-MM-DD") : undefined,
            status: status || undefined,
            page,
            pageSize: SHOWTIME_PAGE_SIZE,
            sortBy: "startTime",
            sortDir: "asc",
        }),
        [cinemaId, date, status, page],
    );

    const { data, isLoading, isError, refetch, isFetching } = useManagerShowtimes(params, cinemaId != null);

    const items = data?.items ?? [];
    const total = data?.totalItems ?? items.length;

    const openModal = (t: ShowtimeModalType, showtime?: ManagerShowtime) => {
        setSelected(showtime ?? null);
        setModalType(t);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const resetToFirstPage = () => setPage(1);

    const columns: ColumnsType<ManagerShowtime> = [
        {
            title: "Movie",
            key: "movie",
            render: (_, r) => (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{r.movie.title}</span>
                    {r.movie.ageRating && (
                        <span style={{ fontSize: 11, color: "var(--dash-text-3)" }}>{r.movie.ageRating}</span>
                    )}
                </div>
            ),
        },
        {
            title: "Room",
            key: "room",
            width: 160,
            render: (_, r) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>
                    {r.room.roomName}
                    <span style={{ color: "var(--dash-text-3)" }}> · {r.room.roomType}</span>
                </span>
            ),
        },
        {
            title: "Date",
            key: "date",
            width: 120,
            render: (_, r) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)", whiteSpace: "nowrap" }}>{fmtDate(r.startTime)}</span>
            ),
        },
        {
            title: "Time",
            key: "time",
            width: 120,
            render: (_, r) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-1)", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {fmtTime(r.startTime)}{r.endTime ? ` – ${fmtTime(r.endTime)}` : ""}
                </span>
            ),
        },
        {
            title: "Price",
            dataIndex: "basePrice",
            key: "basePrice",
            width: 110,
            align: "right",
            render: (p: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{fmtVnd(p)}</span>,
            responsive: ["md"],
        },
        {
            title: "Status",
            key: "status",
            width: 130,
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={`dash-badge ${SHOWTIME_STATUS_BADGE[r.status] ?? "dash-badge--inactive"}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                    {r.isSoldOut && <Tag color="red" style={{ margin: 0 }}>Sold out</Tag>}
                </div>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 96,
            align: "right",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Edit showtime">
                        <button className="dash-icon-btn" aria-label="Edit showtime" onClick={() => openModal("edit", record)}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete showtime">
                        <button className="dash-icon-btn" aria-label="Delete showtime" onClick={() => openModal("delete", record)} style={{ color: "#E8001C" }}>
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
                        <h1 className="dash-page-title">Showtime Management</h1>
                        <p className="dash-page-sub">
                            Schedule and manage showtimes{user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}.
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusIcon />}
                        onClick={() => openModal("create")}
                        disabled={!cinemaId}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                        Add Showtime
                    </Button>
                </div>
            </div>

            {!cinemaId && !isLoading ? (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            ) : (
                <>
                    <div className="dash-toolbar">
                        <div className="dash-toolbar__left">
                            <DatePicker
                                value={date}
                                onChange={(d) => { setDate(d); resetToFirstPage(); }}
                                format="DD/MM/YYYY"
                                placeholder="Filter by date"
                                style={{ width: 170 }}
                            />
                            <Select
                                value={status}
                                onChange={(v) => { setStatus(v); resetToFirstPage(); }}
                                options={[...SHOWTIME_STATUS_FILTER_OPTIONS]}
                                style={{ width: 150 }}
                            />
                        </div>
                    </div>

                    {isError ? (
                        <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load showtimes</p>
                            <Button onClick={() => refetch()}>Retry</Button>
                        </div>
                    ) : (
                        <div className="dash-card" style={{ overflow: "hidden" }}>
                            <Table<ManagerShowtime>
                                dataSource={items}
                                columns={columns}
                                rowKey="showtimeId"
                                loading={isLoading || isFetching}
                                onChange={(p) => setPage(p.current ?? 1)}
                                pagination={{
                                    current: page,
                                    pageSize: SHOWTIME_PAGE_SIZE,
                                    total,
                                    showSizeChanger: false,
                                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} showtimes`,
                                    style: { padding: "12px 16px", marginBottom: 0 },
                                }}
                                scroll={{ x: 760 }}
                                rowHoverable
                            />
                        </div>
                    )}
                </>
            )}

            {cinemaId && (
                <>
                    <ShowtimeModal
                        mode={modalType === "edit" ? "edit" : "create"}
                        showtime={selected}
                        cinemaId={cinemaId}
                        open={modalType === "create" || modalType === "edit"}
                        onClose={closeModal}
                    />
                    <DeleteShowtimeModal showtime={selected} open={modalType === "delete"} onClose={closeModal} />
                </>
            )}
        </div>
    );
};

export default ShowtimeManagementPage;
