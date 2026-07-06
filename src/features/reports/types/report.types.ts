export interface RevenueSummary {
    grossRevenue: number;
    ticketRevenue: number;
    fnbRevenue: number;
    discountAmount: number;
    bookingCount: number;
    ticketsSold: number;
    averageOrderValue: number;
}

export interface MoviePerformanceRow {
    movieId: number;
    title: string;
    showtimeCount: number;
    bookingCount: number;
    ticketsSold: number;
    /** Percentage already (0..100), NOT a 0..1 fraction. */
    occupancyRate: number;
    revenue: number;
}

export interface TopSellingMovie {
    movieId: number;
    title: string;
    ticketsSold: number;
}

export interface TopSellingFnbProduct {
    productId: number;
    productName: string;
    quantitySold: number;
}

export interface TopSellingCinema {
    cinemaId: number;
    cinemaName: string;
    bookingCount: number;
    ticketsSold: number;
}

export interface TopSelling {
    movies: TopSellingMovie[];
    fnbProducts: TopSellingFnbProduct[];
    cinemas: TopSellingCinema[];
}

/** A single point on the revenue-over-time chart, normalized from
 *  GET /reports/revenue regardless of groupBy (day/week/month each have a
 *  different raw shape — see report.service.ts). */
export interface RevenuePoint {
    /** X-axis label: the date itself for "day", "2026-W22" for "week", "2026-06" for "month". */
    label: string;
    revenue: number;
    ticketRevenue: number;
    fnbRevenue: number;
    bookingCount: number;
    ticketsSold: number;
}

export type RevenueGroupBy = "day" | "week" | "month";

export interface RevenueTimeseriesQuery {
    startDate: string;
    endDate: string;
    groupBy: RevenueGroupBy;
}

export interface ReportQuery {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    cinemaId?: number | null;
    searchMovie?: string;
}

export type ReportExportFormat = "pdf" | "excel";
export type ReportExportType = "revenue" | "fnb" | "occupancy";

export interface ExportReportQuery extends ReportQuery {
    format: ReportExportFormat;
    reportType: ReportExportType;
}
