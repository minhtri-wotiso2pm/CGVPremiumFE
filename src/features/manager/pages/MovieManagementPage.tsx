import { type FC, useMemo, useState } from "react";
import { Button, Tabs } from "antd";
import { useMovieList } from "../hooks/useMovieList";
import type { MovieListItem, MovieModalType } from "../types/movie-mgmt.types";
import MovieToolbar from "../components/MovieToolbar";
import MovieTable from "../components/MovieTable";
import MovieFormModal from "../components/MovieFormModal";
import DeleteMovieModal from "../components/DeleteMovieModal";
import GenreSection from "../components/GenreSection";

const PAGE_SIZE = 10;

/* ── Icons ── */
const FilmIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
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
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/* ── Stat pill ── */
const StatPill: FC<{ label: string; value: number; color?: "green" | "blue" | "muted" | "red" }> = ({
    label, value, color = "muted",
}) => {
    const bg = color === "green" ? "rgba(34,197,94,0.06)"
             : color === "blue"  ? "rgba(59,130,246,0.06)"
             : color === "red"   ? "rgba(232,0,28,0.06)"
             : "rgba(0,0,0,0.03)";
    const border = color === "green" ? "rgba(34,197,94,0.18)"
                 : color === "blue"  ? "rgba(59,130,246,0.18)"
                 : color === "red"   ? "rgba(232,0,28,0.14)"
                 : "var(--dash-border)";
    const dot = color === "green" ? "#22c55e"
              : color === "blue"  ? "#3b82f6"
              : color === "red"   ? "#E8001C"
              : "var(--dash-text-3)";

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 20,
            background: bg, border: `1px solid ${border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
                {value}
            </span>
            <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
        </div>
    );
};

/* ══════════════════════════════════════════
   MovieManagementPage
══════════════════════════════════════════ */
const MovieManagementPage: FC = () => {
    const { data, isLoading, isError, refetch, isFetching } = useMovieList();
    const movies: MovieListItem[] = data?.items ?? [];

    /* ── Filter state ── */
    const [search, setSearch]     = useState("");
    const [status, setStatus]     = useState("");
    const [page, setPage]         = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    /* ── Modal state ── */
    const [modalType, setModalType]         = useState<MovieModalType | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<MovieListItem | null>(null);

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total:      movies.length,
        nowShowing: movies.filter((m) => m.status === "now_showing").length,
        comingSoon: movies.filter((m) => m.status === "coming_soon").length,
        ended:      movies.filter((m) => m.status === "ended").length,
    }), [movies]);

    /* ── Client-side filter ── */
    const filtered = useMemo(() => {
        let result = movies;
        const q = search.trim().toLowerCase();
        if (q) result = result.filter((m) => m.title.toLowerCase().includes(q));
        if (status) result = result.filter((m) => m.status === status);
        return result;
    }, [movies, search, status]);

    /* ── Pagination ── */
    const paged = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page, pageSize],
    );

    /* ── Handlers ── */
    const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
    const handleStatusChange = (v: string) => { setStatus(v); setPage(1); };

    const openModal = (type: MovieModalType, movie?: MovieListItem) => {
        setSelectedMovie(movie ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelectedMovie(null);
    };

    const isEmpty       = !isLoading && !isError && movies.length === 0;
    const isFilterEmpty = !isLoading && !isError && movies.length > 0 && filtered.length === 0;

    /* ── Tab: Movies ── */
    const movieTabContent = (
        <div>
            {isError && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)" }}><AlertIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Không tải được danh sách phim
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
                    </p>
                    <Button onClick={() => refetch()} style={{ marginTop: 4 }}>Thử lại</Button>
                </div>
            )}

            {isEmpty && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "72px 24px", textAlign: "center" }}>
                    <div style={{ color: "var(--dash-text-3)", opacity: 0.5 }}><FilmIcon /></div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Chưa có phim nào
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                        Thêm phim đầu tiên vào hệ thống.
                    </p>
                    <Button
                        type="primary"
                        icon={<PlusIcon />}
                        onClick={() => openModal("create")}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
                    >
                        Thêm phim
                    </Button>
                </div>
            )}

            {!isError && !isEmpty && (
                <>
                    <MovieToolbar
                        search={search}
                        status={status}
                        isRefreshing={isFetching}
                        onSearchChange={handleSearchChange}
                        onStatusChange={handleStatusChange}
                        onRefresh={() => refetch()}
                        onAdd={() => openModal("create")}
                    />

                    {isFilterEmpty ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "52px 24px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                                Không tìm thấy kết quả
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>
                                Thử điều chỉnh từ khóa hoặc bộ lọc trạng thái.
                            </p>
                            <Button size="small" onClick={() => { setSearch(""); setStatus(""); }}>
                                Xóa bộ lọc
                            </Button>
                        </div>
                    ) : (
                        <MovieTable
                            data={paged}
                            total={filtered.length}
                            page={page}
                            pageSize={pageSize}
                            loading={isLoading}
                            onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                            onAction={(movie, type) => openModal(type, movie)}
                        />
                    )}
                </>
            )}
        </div>
    );

    /* ── Render ── */
    return (
        <div className="dash-fade-in">
            {/* Page header */}
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Quản lý phim</h1>
                        <p className="dash-page-sub">Quản lý danh sách phim và thể loại trong hệ thống.</p>
                    </div>
                    {!isLoading && !isError && movies.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Tổng"        value={stats.total}      color="muted" />
                            <StatPill label="Đang chiếu"  value={stats.nowShowing} color="green" />
                            <StatPill label="Sắp chiếu"   value={stats.comingSoon} color="blue" />
                            <StatPill label="Đã kết thúc" value={stats.ended}      color="red" />
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                defaultActiveKey="movies"
                items={[
                    { key: "movies", label: "Phim",      children: movieTabContent },
                    { key: "genres", label: "Thể loại",  children: <GenreSection /> },
                ]}
            />

            {/* Modals */}
            <MovieFormModal
                mode={modalType === "edit" ? "edit" : "create"}
                movieId={selectedMovie?.movieId ?? null}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteMovieModal
                movie={selectedMovie}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default MovieManagementPage;
