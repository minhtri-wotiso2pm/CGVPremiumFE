import { type FC } from "react";
import { Table, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MovieListItem, MovieModalType } from "../types/movie-mgmt.types";
import { MOVIE_STATUS_LABELS } from "../types/movie-mgmt.types";

interface Props {
    data: MovieListItem[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    onPageChange: (page: number, pageSize: number) => void;
    onAction: (movie: MovieListItem, type: MovieModalType) => void;
}

/* ── Status badge ── */
const StatusBadge: FC<{ status: string }> = ({ status }) => {
    const label = MOVIE_STATUS_LABELS[status] ?? status;
    const cls =
        status === "now_showing" ? "dash-badge dash-badge--active"
        : status === "coming_soon" ? "dash-badge dash-badge--pending"
        : "dash-badge dash-badge--inactive";
    return <span className={cls}>{label}</span>;
};

/* ── Poster thumbnail ── */
const PosterCell: FC<{ url?: string | null; title: string }> = ({ url, title }) => (
    url ? (
        <img
            src={url}
            alt={title}
            style={{
                width: 36, height: 50, objectFit: "cover",
                borderRadius: 4, display: "block",
            }}
        />
    ) : (
        <div style={{
            width: 36, height: 50, borderRadius: 4,
            background: "var(--dash-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
        }}>
            🎬
        </div>
    )
);

/* ── Skeleton ── */
const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
        {[48, 52, 200, 140, 80, 70, 100, 80].map((w, i) => (
            <td key={i} style={{ padding: "14px 12px" }}>
                <div className="dash-skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
            </td>
        ))}
    </tr>
);

const MovieTableSkeleton = () => (
    <div className="dash-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
        </table>
    </div>
);

/* ── Action buttons ── */
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

/* ══════════════════════
   MovieTable
══════════════════════ */
const MovieTable: FC<Props> = ({
    data, total, page, pageSize, loading, onPageChange, onAction,
}) => {
    if (loading) return <MovieTableSkeleton />;

    const columns: ColumnsType<MovieListItem> = [
        {
            title: "#",
            key: "index",
            width: 48,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {(page - 1) * pageSize + i + 1}
                </span>
            ),
        },
        {
            title: "",
            key: "poster",
            width: 52,
            render: (_, r) => <PosterCell url={r.posterUrl} title={r.title} />,
        },
        {
            title: "Tên phim",
            dataIndex: "title",
            key: "title",
            render: (title: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>
                    {title}
                </span>
            ),
        },
        {
            title: "Thể loại",
            dataIndex: "genres",
            key: "genres",
            render: (genres: string[] | undefined) => {
                if (!genres?.length) return <span style={{ color: "var(--dash-text-3)", fontSize: 12 }}>—</span>;
                const display = genres.slice(0, 3);
                const more = genres.length - 3;
                return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {display.map((g) => (
                            <span key={g} style={{
                                padding: "2px 8px", borderRadius: 10,
                                background: "rgba(232,0,28,0.07)",
                                border: "1px solid rgba(232,0,28,0.15)",
                                fontSize: 11, color: "var(--dash-text-1)",
                            }}>{g}</span>
                        ))}
                        {more > 0 && (
                            <span style={{ fontSize: 11, color: "var(--dash-text-3)" }}>+{more}</span>
                        )}
                    </div>
                );
            },
            responsive: ["md"],
        },
        {
            title: "Thời lượng",
            dataIndex: "durationMinutes",
            key: "duration",
            width: 100,
            render: (d?: number) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>
                    {d ? `${d} phút` : "—"}
                </span>
            ),
            responsive: ["lg"],
        },
        {
            title: "Xếp hạng",
            dataIndex: "ageRating",
            key: "ageRating",
            width: 80,
            render: (r?: string) => r ? (
                <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 7px",
                    borderRadius: 4, background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--dash-text-1)",
                }}>{r}</span>
            ) : <span style={{ color: "var(--dash-text-3)", fontSize: 12 }}>—</span>,
            responsive: ["lg"],
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => <StatusBadge status={status} />,
        },
        {
            title: "",
            key: "actions",
            width: 90,
            align: "center",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    <Tooltip title="Sửa">
                        <button
                            className="dash-icon-btn"
                            onClick={() => onAction(record, "edit")}
                            aria-label="Edit"
                        >
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <button
                            className="dash-icon-btn dash-icon-btn--danger"
                            onClick={() => onAction(record, "delete")}
                            aria-label="Delete"
                        >
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<MovieListItem>
                dataSource={data}
                columns={columns}
                rowKey="movieId"
                onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (t, range) => `${range[0]}–${range[1]} / ${t} phim`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 640 }}
                rowHoverable
            />
        </div>
    );
};

export default MovieTable;
