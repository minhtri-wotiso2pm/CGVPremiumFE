import { type FC, useMemo, useState } from "react";
import { Button } from "antd";
import { useCinemas } from "../hooks/useCinemas";
import type { Cinema, CinemaModalType } from "../types/cinema.types";
import { CINEMA_PAGE_SIZE } from "../constants/cinema.constants";
import CinemaToolbar from "../components/CinemaToolbar";
import CinemaTable from "../components/CinemaTable";
import CinemaModal from "../components/CinemaModal";
import DeleteCinemaModal from "../components/DeleteCinemaModal";

/* ── Icons ── */
const BuildingIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="18" />
        <path d="M16 8h4l3 3v10h-7V8z" />
        <line x1="5" y1="7" x2="5" y2="7.01" strokeWidth="2" />
        <line x1="9" y1="7" x2="9" y2="7.01" strokeWidth="2" />
        <line x1="5" y1="11" x2="5" y2="11.01" strokeWidth="2" />
        <line x1="9" y1="11" x2="9" y2="11.01" strokeWidth="2" />
        <line x1="5" y1="15" x2="5" y2="15.01" strokeWidth="2" />
        <line x1="9" y1="15" x2="9" y2="15.01" strokeWidth="2" />
    </svg>
);
const AlertIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/* ── Stat pill ── */
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

const CinemaManagementPage: FC = () => {
    /* ── Data ── */
    const { data: cinemas = [], isLoading, isError, refetch, isFetching } = useCinemas();

    /* ── Filter state ── */
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(CINEMA_PAGE_SIZE);

    /* ── Modal state ── */
    const [modalType, setModalType] = useState<CinemaModalType | null>(null);
    const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);

    /* ── Stats (from raw data) ── */
    const stats = useMemo(() => ({
        total: cinemas.length,
        active: cinemas.filter((c) => c.status === "ACTIVE").length,
        inactive: cinemas.filter((c) => c.status === "INACTIVE").length,
    }), [cinemas]);

    /* ── Local filter ── */
    const filtered = useMemo(() => {
        let result = cinemas;
        const q = search.trim().toLowerCase();
        if (q) {
            result = result.filter(
                (c) =>
                    c.cinemaName.toLowerCase().includes(q) ||
                    c.address.toLowerCase().includes(q)
            );
        }
        if (status) {
            result = result.filter((c) => c.status === status);
        }
        return result;
    }, [cinemas, search, status]);

    /* ── FE Pagination ── */
    const paged = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page, pageSize]
    );

    /* ── Handlers ── */
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };
    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };
    const handlePageChange = (p: number, ps: number) => {
        setPage(p);
        setPageSize(ps);
    };

    const openModal = (type: CinemaModalType, cinema?: Cinema) => {
        setSelectedCinema(cinema ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelectedCinema(null);
    };

    /* ── Empty / Error ── */
    const isEmpty = !isLoading && !isError && cinemas.length === 0;
    const isFilterEmpty = !isLoading && !isError && cinemas.length > 0 && filtered.length === 0;

    /* ── Render ── */
    return (
        <div className="dash-fade-in">
            {/* Page Header */}
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Cinema Management</h1>
                        <p className="dash-page-sub">Manage your cinema locations and their status.</p>
                    </div>
                    {/* Stats pills */}
                    {!isLoading && !isError && cinemas.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total" value={stats.total} muted />
                            <StatPill label="Active" value={stats.active} />
                            <StatPill label="Inactive" value={stats.inactive} accent />
                        </div>
                    )}
                </div>
            </div>

            {/* Error state */}
            {isError && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 16, padding: "64px 24px", textAlign: "center",
                }}>
                    <div style={{ color: "var(--dash-text-3)" }}><AlertIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Failed to load cinemas
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        An error occurred while fetching data. Please try again.
                    </p>
                    <Button onClick={() => refetch()} style={{ marginTop: 4 }}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty state — no cinemas yet */}
            {isEmpty && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 16, padding: "72px 24px", textAlign: "center",
                }}>
                    <div style={{ color: "var(--dash-text-3)", opacity: 0.5 }}><BuildingIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        No cinemas yet
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        Get started by adding your first cinema location.
                    </p>
                    <Button
                        type="primary"
                        icon={<PlusIcon />}
                        onClick={() => openModal("create")}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
                    >
                        Add Cinema
                    </Button>
                </div>
            )}

            {/* Main content — toolbar + table */}
            {!isError && !isEmpty && (
                <>
                    <CinemaToolbar
                        search={search}
                        status={status}
                        isRefreshing={isFetching}
                        onSearchChange={handleSearchChange}
                        onStatusChange={handleStatusChange}
                        onRefresh={() => refetch()}
                        onAdd={() => openModal("create")}
                    />

                    {/* Filter empty state */}
                    {isFilterEmpty ? (
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            gap: 12, padding: "52px 24px", textAlign: "center",
                        }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                                No results found
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                                Try adjusting your search or filter.
                            </p>
                            <Button size="small" onClick={() => { setSearch(""); setStatus(""); }}>
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        <CinemaTable
                            data={paged}
                            total={filtered.length}
                            page={page}
                            pageSize={pageSize}
                            loading={isLoading}
                            processingId={null}
                            onPageChange={handlePageChange}
                            onAction={(cinema, type) => openModal(type, cinema)}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <CinemaModal
                mode={modalType === "edit" ? "edit" : "create"}
                cinema={selectedCinema}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteCinemaModal
                cinema={selectedCinema}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default CinemaManagementPage;
