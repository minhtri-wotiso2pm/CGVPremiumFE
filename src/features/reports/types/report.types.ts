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
    occupancyRate: number; // 0..1
    revenue: number;
}

export interface ReportQuery {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    cinemaId?: number | null;
    searchMovie?: string;
}

export type ReportExportType = "revenue" | "movie";

export interface ExportReportQuery extends ReportQuery {
    format: "excel";
    reportType: ReportExportType;
}
