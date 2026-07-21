import { type FC } from "react";
import { Table, Progress, Button, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MoviePerformanceRow } from "../types/report.types";
import { formatVnd, formatNumber } from "../utils/formatters";

interface Props {
    data: MoviePerformanceRow[];
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    /** movieId → poster URL. The movie-performance endpoint doesn't return
     *  posters itself, so the page joins it in from the movie list. */
    posterByMovieId?: Record<number, string | null | undefined>;
}

const occupancyColor = (pct: number) => {
    if (pct >= 70) return "#1B9E4B";
    if (pct >= 35) return "#E8001C";
    return "#AEAEB2";
};

const MoviePoster: FC<{ src?: string | null; title: string }> = ({ src, title }) => (
    src ? (
        <img src={src} alt={title} className="rpt-movie-poster" />
    ) : (
        <div className="rpt-movie-poster rpt-movie-poster--empty" aria-hidden="true" />
    )
);

/** Mobile fallback — the antd Table scrolls horizontally on narrow
 *  screens too, but a stacked card reads far better on a phone. Both
 *  markups render; CSS toggles which one is visible per breakpoint
 *  (see .rpt-movie-table / .rpt-movie-cards in reports.css). */
const MovieCardList: FC<{ data: MoviePerformanceRow[]; posterByMovieId: Record<number, string | null | undefined> }> = ({ data, posterByMovieId }) => (
    <div className="rpt-movie-cards">
        {data.map((m) => (
            <div key={m.movieId} className="rpt-movie-card">
                <div className="rpt-movie-card__head">
                    <MoviePoster src={posterByMovieId[m.movieId]} title={m.title} />
                    <div className="rpt-movie-card__head-text">
                        <span className="rpt-movie-card__title">{m.title}</span>
                        <span className="rpt-movie-card__revenue">{formatVnd(m.revenue)}</span>
                    </div>
                </div>
                <div className="rpt-movie-card__stats">
                    <span>{formatNumber(m.showtimeCount)} showtimes</span>
                    <span>{formatNumber(m.bookingCount)} bookings</span>
                    <span>{formatNumber(m.ticketsSold)} tickets</span>
                </div>
                <Progress
                    percent={Math.round(m.occupancyRate)}
                    size="small"
                    strokeColor={occupancyColor(m.occupancyRate)}
                    format={(p) => `${p}% occupancy`}
                />
            </div>
        ))}
    </div>
);

const MoviePerformanceTable: FC<Props> = ({ data, loading, isError, onRetry, posterByMovieId = {} }) => {
    const columns: ColumnsType<MoviePerformanceRow> = [
        {
            title: "#",
            key: "index",
            width: 44,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            ),
        },
        {
            title: "Movie",
            key: "title",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MoviePoster src={posterByMovieId[r.movieId]} title={r.title} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{r.title}</span>
                </div>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: "Showtimes",
            dataIndex: "showtimeCount",
            key: "showtimeCount",
            width: 110,
            align: "right",
            onHeaderCell: () => ({ className: "rpt-th-right-sort" }),
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{formatNumber(v)}</span>,
            sorter: (a, b) => a.showtimeCount - b.showtimeCount,
            responsive: ["md"],
        },
        {
            title: "Bookings",
            dataIndex: "bookingCount",
            key: "bookingCount",
            width: 100,
            align: "right",
            onHeaderCell: () => ({ className: "rpt-th-right-sort" }),
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{formatNumber(v)}</span>,
            sorter: (a, b) => a.bookingCount - b.bookingCount,
            responsive: ["md"],
        },
        {
            title: "Tickets",
            dataIndex: "ticketsSold",
            key: "ticketsSold",
            width: 100,
            align: "right",
            onHeaderCell: () => ({ className: "rpt-th-right-sort" }),
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{formatNumber(v)}</span>,
            sorter: (a, b) => a.ticketsSold - b.ticketsSold,
        },
        {
            title: "Occupancy",
            dataIndex: "occupancyRate",
            key: "occupancyRate",
            width: 160,
            render: (rate: number) => (
                <Progress
                    percent={Math.round(rate)}
                    size="small"
                    strokeColor={occupancyColor(rate)}
                    format={(p) => `${p}%`}
                />
            ),
            sorter: (a, b) => a.occupancyRate - b.occupancyRate,
            responsive: ["lg"],
        },
        {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            width: 150,
            align: "right",
            onHeaderCell: () => ({ className: "rpt-th-right-sort" }),
            render: (v: number) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text-1)" }}>{formatVnd(v)}</span>
            ),
            sorter: (a, b) => a.revenue - b.revenue,
            defaultSortOrder: "descend",
        },
    ];

    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load movie performance
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px" }}>
                <Empty description="No data for the selected period" />
            </div>
        );
    }

    return (
        <>
            <div className="dash-card rpt-movie-table" style={{ overflow: "hidden" }}>
                <Table<MoviePerformanceRow>
                    dataSource={data}
                    columns={columns}
                    rowKey="movieId"
                    loading={loading}
                    sticky
                    pagination={{
                        pageSize: 10,
                        hideOnSinglePage: true,
                        showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} movies`,
                        style: { padding: "12px 16px", marginBottom: 0 },
                    }}
                    scroll={{ x: 720 }}
                    rowHoverable
                />
            </div>
            <MovieCardList data={data} posterByMovieId={posterByMovieId} />
        </>
    );
};

export default MoviePerformanceTable;
