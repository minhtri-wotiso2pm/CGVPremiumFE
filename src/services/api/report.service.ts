import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RevenueSummary,
    MoviePerformanceRow,
    ReportQuery,
    ExportReportQuery,
} from "@/features/reports/types/report.types";

/**
 * Reports live under /api/v1/reports/* — note the extra `/v1/` segment
 * that other endpoints don't have. axiosInstance.baseURL already ends
 * with `/api`, so paths here start at `/v1/reports`.
 */

const buildParams = (q: ReportQuery): Record<string, string> => {
    const params: Record<string, string> = {
        startDate: q.startDate,
        endDate: q.endDate,
    };
    if (q.cinemaId != null) params.cinemaId = String(q.cinemaId);
    if (q.searchMovie && q.searchMovie.trim()) params.searchMovie = q.searchMovie.trim();
    return params;
};

export const getRevenueSummaryApi = async (q: ReportQuery): Promise<RevenueSummary> => {
    const { data } = await axiosInstance.get("/v1/reports/revenue-summary", {
        params: buildParams(q),
    });
    return {
        grossRevenue: Number(data?.grossRevenue ?? 0),
        ticketRevenue: Number(data?.ticketRevenue ?? 0),
        fnbRevenue: Number(data?.fnbRevenue ?? 0),
        discountAmount: Number(data?.discountAmount ?? 0),
        bookingCount: Number(data?.bookingCount ?? 0),
        ticketsSold: Number(data?.ticketsSold ?? 0),
        averageOrderValue: Number(data?.averageOrderValue ?? 0),
    };
};

export const getMoviePerformanceApi = async (q: ReportQuery): Promise<MoviePerformanceRow[]> => {
    const { data } = await axiosInstance.get("/v1/reports/movie-performance", {
        params: buildParams(q),
    });
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map((r) => ({
        movieId: Number(r.movieId),
        title: String(r.title ?? ""),
        showtimeCount: Number(r.showtimeCount ?? 0),
        bookingCount: Number(r.bookingCount ?? 0),
        ticketsSold: Number(r.ticketsSold ?? 0),
        occupancyRate: Number(r.occupancyRate ?? 0),
        revenue: Number(r.revenue ?? 0),
    }));
};

/** Downloads the Excel report as a blob (auth header required, so no plain <a href>). */
export const exportReportApi = async (q: ExportReportQuery): Promise<void> => {
    const response = await axiosInstance.get("/v1/reports/export", {
        params: { ...buildParams(q), format: q.format, reportType: q.reportType },
        responseType: "blob",
    });

    const blob = new Blob([response.data], {
        type: response.headers["content-type"]
            ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Prefer the server-provided filename, else build a readable default.
    let filename = `report-${q.reportType}-${q.startDate}_${q.endDate}.xlsx`;
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (match?.[1]) filename = decodeURIComponent(match[1]);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
