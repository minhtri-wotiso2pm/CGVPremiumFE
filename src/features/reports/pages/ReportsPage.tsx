import { type FC, useMemo, useState } from "react";
import { DatePicker, Select, Input, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useCinemas } from "@/features/manager/hooks/useCinemas";
import { useMovieList } from "@/features/manager/hooks/useMovieList";
import { useRevenueTrend, useMoviePerformance, useTopSelling, useRevenueTimeseries } from "../hooks/useReports";
import { computeInsights } from "../utils/insights";
import { DEFAULT_REPORT_DAYS } from "../constants/report.constants";
import type { RevenueGroupBy } from "../types/report.types";
import KpiCardsGrid from "../components/KpiCardsGrid";
import RevenueAnalyticsSection from "../components/RevenueAnalyticsSection";
import MoviePerformanceTable from "../components/MoviePerformanceTable";
import TopSellingSection from "../components/TopSellingSection";
import QuickInsightsSection from "../components/QuickInsightsSection";
import ExportMenu from "../components/ExportMenu";
import "../reports.css";

const { RangePicker } = DatePicker;
const { Search } = Input;

const RefreshIcon = ({ spin }: { spin: boolean }) => (
    <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: "transform 0.5s", transform: spin ? "rotate(360deg)" : "rotate(0deg)" }}
    >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
);

interface Props {
    scope: "admin" | "manager";
}

const ReportsPage: FC<Props> = ({ scope }) => {
    // Ensures redux user.cinema is populated for managers landing here directly.
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const isManager = scope === "manager";

    /* Cinema list only needed for the admin selector. */
    const { data: cinemas = [] } = useCinemas();

    /* The movie-performance endpoint doesn't return posters — join them in
     * from the movie list (already cached elsewhere in the app). */
    const { data: movieList } = useMovieList();
    const posterByMovieId = useMemo(
        () => Object.fromEntries((movieList?.items ?? []).map((m) => [m.movieId, m.posterUrl])),
        [movieList],
    );

    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(DEFAULT_REPORT_DAYS - 1, "day"),
        dayjs(),
    ]);
    const [adminCinemaId, setAdminCinemaId] = useState<number | null>(null);
    const [movieApplied, setMovieApplied] = useState("");
    const [movieDraft, setMovieDraft] = useState("");
    const [groupBy, setGroupBy] = useState<RevenueGroupBy>("day");

    const managerCinemaId = user?.cinema?.cinemaId ?? null;
    const cinemaId = isManager ? managerCinemaId : adminCinemaId;

    const startDate = range[0].format("YYYY-MM-DD");
    const endDate = range[1].format("YYYY-MM-DD");

    // Manager must wait for their cinema to load; admin can query with "all".
    const ready = !!startDate && !!endDate && (!isManager || managerCinemaId != null);

    const baseQuery = { startDate, endDate, cinemaId };

    const {
        summary, deltas,
        isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary,
    } = useRevenueTrend(baseQuery, ready);

    const {
        data: movies = [], isFetching: moviesLoading, isError: moviesError, refetch: refetchMovies,
    } = useMoviePerformance({ ...baseQuery, searchMovie: movieApplied }, ready);

    const {
        data: topSelling, isFetching: topLoading, isError: topError, refetch: refetchTop,
    } = useTopSelling(baseQuery, ready);

    const {
        data: revenuePoints = [], isFetching: pointsLoading, isError: pointsError, refetch: refetchPoints,
    } = useRevenueTimeseries({ startDate, endDate, groupBy }, ready);

    const insights = useMemo(() => computeInsights(summary, movies, topSelling), [summary, movies, topSelling]);
    const anyFetching = summaryLoading || moviesLoading || topLoading || pointsLoading;

    const handleRefreshAll = () => {
        refetchSummary();
        refetchMovies();
        refetchTop();
        refetchPoints();
    };

    return (
        <div className="dash-fade-in rpt-page">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="dash-page-title">Report Dashboard</h1>
                    <p className="dash-page-sub">
                        Revenue, performance, and insights
                        {isManager && user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rpt-filters">
                <div className="rpt-filters__left">
                    <RangePicker
                        value={range}
                        allowClear={false}
                        onChange={(vals) => {
                            if (vals && vals[0] && vals[1]) setRange([vals[0], vals[1]]);
                        }}
                        format="DD/MM/YYYY"
                    />

                    {!isManager && (
                        <Select
                            value={adminCinemaId ?? "all"}
                            onChange={(v) => setAdminCinemaId(v === "all" ? null : Number(v))}
                            style={{ width: 220 }}
                            options={[
                                { value: "all", label: "All cinemas" },
                                ...cinemas.map((c) => ({ value: c.cinemaId, label: c.cinemaName })),
                            ]}
                        />
                    )}

                    <Search
                        placeholder="Search movie..."
                        allowClear
                        value={movieDraft}
                        onChange={(e) => {
                            setMovieDraft(e.target.value);
                            if (e.target.value === "") setMovieApplied("");
                        }}
                        onSearch={(v) => setMovieApplied(v)}
                        style={{ width: 220 }}
                    />
                </div>

                <div className="rpt-filters__right">
                    <Tooltip title="Refresh all">
                        <button className="dash-icon-btn" onClick={handleRefreshAll} aria-label="Refresh" disabled={anyFetching}>
                            <RefreshIcon spin={anyFetching} />
                        </button>
                    </Tooltip>
                    <ExportMenu query={{ ...baseQuery, searchMovie: movieApplied }} disabled={!ready} />
                </div>
            </div>

            {isManager && managerCinemaId == null ? (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            ) : (
                <>
                    <KpiCardsGrid summary={summary} deltas={deltas} loading={summaryLoading} />

                    <h2 className="rpt-section-title">Revenue Analytics</h2>
                    <RevenueAnalyticsSection
                        points={revenuePoints}
                        summary={summary}
                        groupBy={groupBy}
                        onGroupByChange={setGroupBy}
                        loading={pointsLoading}
                        isError={pointsError || summaryError}
                        onRetry={() => { refetchPoints(); refetchSummary(); }}
                    />

                    <h2 className="rpt-section-title">Movie Performance</h2>
                    <MoviePerformanceTable
                        data={movies}
                        loading={moviesLoading}
                        isError={moviesError}
                        onRetry={refetchMovies}
                        posterByMovieId={posterByMovieId}
                    />

                    <h2 className="rpt-section-title">Top Selling</h2>
                    <TopSellingSection
                        data={topSelling}
                        loading={topLoading}
                        isError={topError}
                        onRetry={refetchTop}
                    />

                    <h2 className="rpt-section-title">Quick Insights</h2>
                    <QuickInsightsSection insights={insights} loading={anyFetching} />
                </>
            )}
        </div>
    );
};

export default ReportsPage;
