import { type FC, useMemo, useState } from "react";
import { Table, Input, Tag, Tooltip, Popconfirm, Button, Avatar, Card, Select, DatePicker, InputNumber, Drawer, Empty, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { type Dayjs } from "dayjs";
import { useHideReview, useUnhideReview } from "../hooks/useAdminReviews";
import { useMovieReviewDetail, useMovieReviewReports } from "../hooks/useMovieReviewReports";
import type { MovieReviewDetailReviewItem, MovieReviewReportItem, MovieReviewReportSortBy, MovieReviewReportSortDir } from "../types/review.types";
import { MOVIE_REVIEW_REPORT_PAGE_SIZE } from "../constants/review.constants";
import StarRating from "../components/StarRating";
import ReviewSummary from "../components/ReviewSummary";

const { Search } = Input;
const { RangePicker } = DatePicker;

const fmtDate = (iso: string | null | undefined): string => {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return "";
    }
};

const fmtDateTime = (iso: string | null | undefined): string => {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
};

const EyeOffGlyph: FC = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
);

const EyeGlyph: FC = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

const MoviePoster: FC<{ posterUrl?: string | null; title: string }> = ({ posterUrl, title }) => {
    if (posterUrl) {
        return (
            <img
                src={posterUrl}
                alt={title}
                style={{ width: 54, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }}
            />
        );
    }

    return (
        <div style={{ width: 54, height: 80, borderRadius: 10, background: "linear-gradient(135deg, #FBE7E8 0%, #E8001C 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
            {title?.slice(0, 2).toUpperCase() || "MV"}
        </div>
    );
};

const BreakdownMini: FC<{ item: MovieReviewReportItem }> = ({ item }) => {
    const rows = [
        { label: "5★", value: item.fiveStarCount },
        { label: "4★", value: item.fourStarCount },
        { label: "3★", value: item.threeStarCount },
        { label: "2★", value: item.twoStarCount },
        { label: "1★", value: item.oneStarCount },
    ];
    const maxValue = Math.max(...rows.map((row) => row.value), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 150 }}>
            {rows.map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-2)", width: 24 }}>{row.label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#F1F1F3", overflow: "hidden" }}>
                        <div style={{ width: `${(row.value / maxValue) * 100}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #E8001C 0%, #FF7A7A 100%)" }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-1)", width: 24, textAlign: "right" }}>{row.value}</span>
                </div>
            ))}
        </div>
    );
};

const ReviewModerationPage: FC = () => {
    const { mutate: hide, isPending: hiding } = useHideReview();
    const { mutate: unhide, isPending: unhiding } = useUnhideReview();
    const busy = hiding || unhiding;

    const [reportSearch, setReportSearch] = useState("");
    const [reportDateRange, setReportDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [reportMinRating, setReportMinRating] = useState<number | null>(null);
    const [reportMaxRating, setReportMaxRating] = useState<number | null>(null);
    const [reportSortBy, setReportSortBy] = useState<MovieReviewReportSortBy>("newestReview");
    const [reportSortDir, setReportSortDir] = useState<MovieReviewReportSortDir>("desc");
    const [reportPage, setReportPage] = useState(1);
    const [selectedMovie, setSelectedMovie] = useState<MovieReviewReportItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailDateRange, setDetailDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [detailMinRating, setDetailMinRating] = useState<number | null>(null);
    const [detailMaxRating, setDetailMaxRating] = useState<number | null>(null);
    const [detailPage, setDetailPage] = useState(1);

    const reportParams = useMemo(() => ({
        searchTitle: reportSearch || undefined,
        fromDate: reportDateRange[0] ? reportDateRange[0].toISOString() : undefined,
        toDate: reportDateRange[1] ? reportDateRange[1].toISOString() : undefined,
        minAverageRating: reportMinRating ?? undefined,
        maxAverageRating: reportMaxRating ?? undefined,
        sortBy: reportSortBy,
        sortDir: reportSortDir,
        page: reportPage,
        pageSize: MOVIE_REVIEW_REPORT_PAGE_SIZE,
    }), [reportDateRange, reportMaxRating, reportMinRating, reportPage, reportSearch, reportSortBy, reportSortDir]);

    const { data: reportsData, isLoading: reportsLoading, isFetching: reportsFetching } = useMovieReviewReports(reportParams);

    const detailParams = useMemo(() => ({
        fromDate: detailDateRange[0] ? detailDateRange[0].toISOString() : undefined,
        toDate: detailDateRange[1] ? detailDateRange[1].toISOString() : undefined,
        minRating: detailMinRating ?? undefined,
        maxRating: detailMaxRating ?? undefined,
        page: detailPage,
        pageSize: 10,
    }), [detailDateRange, detailMaxRating, detailMinRating, detailPage]);

    const { data: detailData, isLoading: detailLoading, isFetching: detailFetching } = useMovieReviewDetail(
        selectedMovie?.movieId ?? null,
        detailParams,
        detailOpen,
    );

    const reportSummary = useMemo(() => {
        const items = reportsData?.items ?? [];
        const totalReviews = items.reduce((sum, item) => sum + item.totalReviews, 0);
        const weightedRating = items.reduce((sum, item) => sum + (item.averageRating ?? 0) * item.totalReviews, 0);
        const averageRating = totalReviews > 0 ? weightedRating / totalReviews : null;
        const latestReviewDate = items.reduce<string | null>((latest, item) => {
            if (!item.latestReviewDate) return latest;
            if (!latest) return item.latestReviewDate;
            return item.latestReviewDate > latest ? item.latestReviewDate : latest;
        }, null);

        return {
            totalMovies: reportsData?.totalItems ?? 0,
            totalReviews,
            averageRating,
            latestReviewDate,
        };
    }, [reportsData]);

    const openDetail = (movie: MovieReviewReportItem) => {
        setSelectedMovie(movie);
        setDetailOpen(true);
        setDetailDateRange([null, null]);
        setDetailMinRating(null);
        setDetailMaxRating(null);
        setDetailPage(1);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setSelectedMovie(null);
    };

    const detailColumns: ColumnsType<MovieReviewDetailReviewItem> = [
        {
            title: "Customer",
            key: "customer",
            width: 220,
            render: (_, review) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar size={32} src={review.avatar || undefined} style={{ background: "#E8001C" }}>
                        {initial(review.userName)}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: "var(--dash-text-1)" }}>{review.userName}</div>
                        <div style={{ fontSize: 12, color: "var(--dash-text-2)" }}>Booking #{review.bookingId}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            width: 120,
            render: (rating: number) => <StarRating value={rating} size={13} />,
        },
        {
            title: "Review",
            dataIndex: "comment",
            key: "comment",
            width: 320,
            render: (comment: string) =>
                comment?.trim() ? (
                    <Tooltip title={comment}>
                        <span style={{
                            fontSize: 13,
                            color: "var(--dash-text-2)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            maxWidth: 320,
                        }}>
                            {comment}
                        </span>
                    </Tooltip>
                ) : (
                    <span style={{ fontSize: 13, color: "var(--dash-text-3)", fontStyle: "italic" }}>No comment</span>
                ),
        },
        {
            title: "Date",
            dataIndex: "reviewDate",
            key: "reviewDate",
            width: 150,
            render: (date: string) => <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>{fmtDateTime(date)}</span>,
        },
        {
            title: "Status",
            dataIndex: "isHidden",
            key: "isHidden",
            width: 96,
            render: (hidden: boolean) =>
                hidden ? <Tag color="default">Hidden</Tag> : <Tag color="success">Active</Tag>,
        },
        {
            title: "",
            key: "actions",
            width: 120,
            align: "right",
            render: (_, review) =>
                review.isHidden ? (
                    <Popconfirm
                        title="Restore this review?"
                        description="It will appear on the movie page again."
                        okText="Restore"
                        cancelText="Cancel"
                        onConfirm={() => unhide(review.reviewId)}
                        disabled={busy}
                    >
                        <Button size="small" icon={<EyeGlyph />} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            Unhide
                        </Button>
                    </Popconfirm>
                ) : (
                    <Popconfirm
                        title="Hide this review?"
                        description="It will be removed from the movie page and rating."
                        okText="Hide"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        onConfirm={() => hide(review.reviewId)}
                        disabled={busy}
                    >
                        <Button size="small" danger icon={<EyeOffGlyph />} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            Hide
                        </Button>
                    </Popconfirm>
                ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="dash-page-title">Review Moderation</h1>
                    <p className="dash-page-sub">
                        Monitor movie review performance, inspect detailed feedback, and manage hidden reviews from one place.
                    </p>
                </div>
            </div>

            <div className="dash-card" style={{ marginBottom: 24, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                    <div>
                        <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--dash-text-1)" }}>Movie Review Reports</h2>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>Track review volume, average rating, and recent feedback across movies.</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Card size="small" style={{ minWidth: 146, borderRadius: 12, background: "rgba(232,0,28,0.04)" }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--dash-text-2)" }}>Movies</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text-1)" }}>{reportSummary.totalMovies}</div>
                        </Card>
                        <Card size="small" style={{ minWidth: 146, borderRadius: 12, background: "rgba(232,0,28,0.04)" }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--dash-text-2)" }}>Reviews</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text-1)" }}>{reportSummary.totalReviews}</div>
                        </Card>
                        <Card size="small" style={{ minWidth: 146, borderRadius: 12, background: "rgba(232,0,28,0.04)" }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--dash-text-2)" }}>Avg rating</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text-1)" }}>{reportSummary.averageRating != null ? reportSummary.averageRating.toFixed(1) : "—"}</div>
                        </Card>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                    <Search
                        placeholder="Search by movie title"
                        allowClear
                        value={reportSearch}
                        onChange={(e) => { setReportSearch(e.target.value); setReportPage(1); }}
                        style={{ width: 260 }}
                    />
                    <RangePicker
                        value={reportDateRange}
                        onChange={(values) => { setReportDateRange(values as [Dayjs | null, Dayjs | null]); setReportPage(1); }}
                        style={{ minWidth: 260 }}
                    />
                    <InputNumber
                        min={0}
                        max={5}
                        step={0.1}
                        placeholder="Min rating"
                        value={reportMinRating}
                        onChange={(value) => { setReportMinRating(value as number | null); setReportPage(1); }}
                        style={{ width: 120 }}
                    />
                    <InputNumber
                        min={0}
                        max={5}
                        step={0.1}
                        placeholder="Max rating"
                        value={reportMaxRating}
                        onChange={(value) => { setReportMaxRating(value as number | null); setReportPage(1); }}
                        style={{ width: 120 }}
                    />
                    <Select
                        value={reportSortBy}
                        onChange={(value) => { setReportSortBy(value as MovieReviewReportSortBy); setReportPage(1); }}
                        style={{ width: 170 }}
                        options={[
                            { label: "Movie name", value: "movieName" },
                            { label: "Newest review", value: "newestReview" },
                            { label: "Highest rating", value: "highestRating" },
                            { label: "Lowest rating", value: "lowestRating" },
                            { label: "Most reviews", value: "mostReviews" },
                        ]}
                    />
                    <Select
                        value={reportSortDir}
                        onChange={(value) => { setReportSortDir(value as MovieReviewReportSortDir); setReportPage(1); }}
                        style={{ width: 112 }}
                        options={[
                            { label: "Asc", value: "asc" },
                            { label: "Desc", value: "desc" },
                        ]}
                    />
                </div>

                <Table<MovieReviewReportItem>
                    dataSource={reportsData?.items ?? []}
                    rowKey="movieId"
                    loading={reportsLoading || reportsFetching}
                    onRow={(record) => ({
                        onClick: () => openDetail(record),
                        style: { cursor: "pointer" },
                    })}
                    columns={[
                        {
                            title: "Movie",
                            key: "movie",
                            render: (_, item) => (
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <MoviePoster posterUrl={item.posterUrl} title={item.movieTitle} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: "var(--dash-text-1)" }}>{item.movieTitle}</div>
                                        <div style={{ fontSize: 12, color: "var(--dash-text-2)" }}>Latest review {fmtDate(item.latestReviewDate)}</div>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            title: "Average rating",
                            key: "rating",
                            width: 148,
                            render: (_, item) => <div><StarRating value={item.averageRating ?? 0} size={13} /><div style={{ fontSize: 12, color: "var(--dash-text-2)", marginTop: 4 }}>{item.averageRating != null ? item.averageRating.toFixed(1) : "No rating"}</div></div>,
                        },
                        {
                            title: "Reviews",
                            dataIndex: "totalReviews",
                            key: "totalReviews",
                            width: 110,
                            render: (value: number) => <span style={{ fontWeight: 600, color: "var(--dash-text-1)" }}>{value}</span>,
                        },
                        {
                            title: "Breakdown",
                            key: "breakdown",
                            width: 220,
                            render: (_, item) => <BreakdownMini item={item} />,
                        },
                        {
                            title: "Action",
                            key: "action",
                            width: 120,
                            align: "right",
                            render: (_, item) => <Button type="link" onClick={() => openDetail(item)}>View details</Button>,
                        },
                    ]}
                    pagination={{
                        current: reportPage,
                        pageSize: MOVIE_REVIEW_REPORT_PAGE_SIZE,
                        total: reportsData?.totalItems ?? 0,
                        onChange: setReportPage,
                        showSizeChanger: false,
                        style: { padding: "12px 0 0", marginBottom: 0 },
                    }}
                    scroll={{ x: 980 }}
                    locale={{ emptyText: <Empty description="No movie review reports found." /> }}
                />
            </div>

            <Drawer
                title={selectedMovie ? `${selectedMovie.movieTitle} — review details` : "Movie review details"}
                placement="right"
                width={960}
                open={detailOpen}
                onClose={closeDetail}
                destroyOnClose
            >
                {selectedMovie ? (
                    <div>
                        <div style={{ display: "flex", gap: 16, alignItems: "center", borderBottom: "1px solid var(--dash-border)", paddingBottom: 16 }}>
                            <MoviePoster posterUrl={selectedMovie.posterUrl} title={selectedMovie.movieTitle} />
                            <div>
                                <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--dash-text-1)" }}>{selectedMovie.movieTitle}</h3>
                                <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)" }}>Review analytics and customer feedback for this movie.</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <ReviewSummary
                                averageRating={detailData?.statistics.averageRating ?? null}
                                totalReviews={detailData?.statistics.totalReviews ?? 0}
                                breakdown={detailData?.ratingBreakdown ?? { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }}
                            />
                        </div>

                        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                            <RangePicker
                                value={detailDateRange}
                                onChange={(values) => { setDetailDateRange(values as [Dayjs | null, Dayjs | null]); setDetailPage(1); }}
                                style={{ minWidth: 260 }}
                            />
                            <InputNumber
                                min={1}
                                max={5}
                                placeholder="Min rating"
                                value={detailMinRating}
                                onChange={(value) => { setDetailMinRating(value as number | null); setDetailPage(1); }}
                                style={{ width: 120 }}
                            />
                            <InputNumber
                                min={1}
                                max={5}
                                placeholder="Max rating"
                                value={detailMaxRating}
                                onChange={(value) => { setDetailMaxRating(value as number | null); setDetailPage(1); }}
                                style={{ width: 120 }}
                            />
                        </div>

                        <div style={{ marginTop: 16 }}>
                            {detailLoading || detailFetching ? (
                                <div style={{ padding: 24, borderRadius: 12, background: "#FFFFFF" }}>Loading review details…</div>
                            ) : detailData && detailData.reviews.length > 0 ? (
                                <div style={{ border: "1px solid var(--dash-border)", borderRadius: 14, overflow: "hidden", background: "#FFFFFF" }}>
                                    <Table<MovieReviewDetailReviewItem>
                                        dataSource={detailData.reviews}
                                        columns={detailColumns}
                                        rowKey="reviewId"
                                        pagination={false}
                                       scroll={{ x: 960 }}
                                        rowHoverable
                                        size="middle"
                                       tableLayout="fixed"
                                       style={{ background: "#FFFFFF" }}
                                       locale={{ emptyText: <Empty description="No reviews match the selected filters." /> }}
                                   />
                               </div>
                            ) : (
                                <Empty description="No reviews match the selected filters." />
                            )}
                        </div>

                        {detailData && detailData.totalItems > 0 ? (
                            <div style={{ marginTop: 20 }}>
                                <Pagination
                                    current={detailPage}
                                    pageSize={10}
                                    total={detailData.totalItems}
                                    onChange={setDetailPage}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </Drawer>
        </div>
    );
};

export default ReviewModerationPage;
