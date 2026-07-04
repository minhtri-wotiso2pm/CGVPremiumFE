import { type FC, useState } from "react";
import { DatePicker, Select, Input, Button, Dropdown, Empty } from "antd";
import type { MenuProps } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useCinemas } from "@/features/manager/hooks/useCinemas";
import { useRevenueSummary, useMoviePerformance, useExportReport } from "../hooks/useReports";
import type { ReportExportType } from "../types/report.types";
import { DEFAULT_REPORT_DAYS } from "../constants/report.constants";
import RevenueSummaryCards from "../components/RevenueSummaryCards";
import MoviePerformanceTable from "../components/MoviePerformanceTable";
import "../reports.css";

const { RangePicker } = DatePicker;
const { Search } = Input;

const DownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const ExportIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

interface Props {
    scope: "admin" | "manager";
}

const ReportsPage: FC<Props> = ({ scope }) => {
    // Ensures redux user.cinema is populated for managers.
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const isManager = scope === "manager";

    /* Cinema list only needed for the admin selector. */
    const { data: cinemas = [] } = useCinemas();

    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(DEFAULT_REPORT_DAYS - 1, "day"),
        dayjs(),
    ]);
    const [adminCinemaId, setAdminCinemaId] = useState<number | null>(null);
    const [movieApplied, setMovieApplied] = useState("");
    const [movieDraft, setMovieDraft] = useState("");

    const managerCinemaId = user?.cinema?.cinemaId ?? null;
    const cinemaId = isManager ? managerCinemaId : adminCinemaId;

    const startDate = range[0].format("YYYY-MM-DD");
    const endDate = range[1].format("YYYY-MM-DD");

    // Manager must wait for their cinema to load; admin can query with "all".
    const ready = !!startDate && !!endDate && (!isManager || managerCinemaId != null);

    const baseQuery = { startDate, endDate, cinemaId };
    const { data: summary, isFetching: summaryLoading } = useRevenueSummary(baseQuery, ready);
    const { data: movies = [], isFetching: moviesLoading } = useMoviePerformance(
        { ...baseQuery, searchMovie: movieApplied },
        ready,
    );

    const { mutate: exportReport, isPending: exporting } = useExportReport();

    const handleExport = (reportType: ReportExportType) => {
        exportReport({ ...baseQuery, searchMovie: movieApplied, format: "excel", reportType });
    };

    const exportMenu: MenuProps = {
        items: [
            { key: "revenue", label: "Revenue summary" },
            { key: "movie", label: "Movie performance" },
        ],
        onClick: ({ key }) => handleExport(key as ReportExportType),
    };

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 18 }}>
                <h1 className="dash-page-title">Reports</h1>
                <p className="dash-page-sub">
                    Revenue and movie performance
                    {isManager && user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}.
                </p>
            </div>

            {/* Filters */}
            <div className="rpt-filters">
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
                    placeholder="Filter by movie..."
                    allowClear
                    value={movieDraft}
                    onChange={(e) => {
                        setMovieDraft(e.target.value);
                        if (e.target.value === "") setMovieApplied("");
                    }}
                    onSearch={(v) => setMovieApplied(v)}
                    style={{ width: 220 }}
                />

                <div className="rpt-filters__spacer" />

                <Dropdown menu={exportMenu} trigger={["click"]} disabled={!ready || exporting}>
                    <Button
                        type="primary"
                        loading={exporting}
                        style={{ background: "#E8001C", borderColor: "#E8001C", display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <ExportIcon />
                        Export Excel
                        <DownIcon />
                    </Button>
                </Dropdown>
            </div>

            {isManager && managerCinemaId == null ? (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            ) : (
                <>
                    <RevenueSummaryCards data={summary} loading={summaryLoading} />

                    <h2 className="rpt-section-title">Movie Performance</h2>
                    {!moviesLoading && movies.length === 0 ? (
                        <div className="dash-card" style={{ padding: "48px 24px" }}>
                            <Empty description="No data for the selected period" />
                        </div>
                    ) : (
                        <MoviePerformanceTable data={movies} loading={moviesLoading} />
                    )}
                </>
            )}
        </div>
    );
};

export default ReportsPage;
