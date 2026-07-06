import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RevenueSummary,
    MoviePerformanceRow,
    TopSelling,
    RevenuePoint,
    RevenueTimeseriesQuery,
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

export const getTopSellingApi = async (q: ReportQuery): Promise<TopSelling> => {
    const { data } = await axiosInstance.get("/v1/reports/top-selling", {
        params: buildParams(q),
    });
    const movies: Record<string, unknown>[] = Array.isArray(data?.movies) ? data.movies : [];
    const fnbProducts: Record<string, unknown>[] = Array.isArray(data?.fnbProducts) ? data.fnbProducts : [];
    const cinemas: Record<string, unknown>[] = Array.isArray(data?.cinemas) ? data.cinemas : [];

    return {
        movies: movies.map((m) => ({
            movieId: Number(m.movieId),
            title: String(m.title ?? ""),
            ticketsSold: Number(m.ticketsSold ?? 0),
        })),
        fnbProducts: fnbProducts.map((p) => ({
            productId: Number(p.productId),
            productName: String(p.productName ?? ""),
            quantitySold: Number(p.quantitySold ?? 0),
        })),
        cinemas: cinemas.map((c) => ({
            cinemaId: Number(c.cinemaId),
            cinemaName: String(c.cinemaName ?? ""),
            bookingCount: Number(c.bookingCount ?? 0),
            ticketsSold: Number(c.ticketsSold ?? 0),
        })),
    };
};

/** GET /reports/revenue has no cinemaId filter in its contract — it's a
 *  system-wide timeseries regardless of role/scope for now. */
export const getRevenueTimeseriesApi = async (q: RevenueTimeseriesQuery): Promise<RevenuePoint[]> => {
    const { data } = await axiosInstance.get("/v1/reports/revenue", {
        params: { startDate: q.startDate, endDate: q.endDate, groupBy: q.groupBy },
    });
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.items ?? []);

    return list.map((r) => {
        const label = String(r.date ?? r.week ?? r.month ?? "");
        return {
            label,
            revenue: Number(r.revenue ?? 0),
            ticketRevenue: Number(r.ticketRevenue ?? 0),
            fnbRevenue: Number(r.fnbRevenue ?? 0),
            bookingCount: Number(r.bookingCount ?? 0),
            ticketsSold: Number(r.ticketsSold ?? 0),
        };
    });
};

const EXPORT_MIME: Record<ExportReportQuery["format"], string> = {
    pdf: "application/pdf",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
const EXPORT_EXT: Record<ExportReportQuery["format"], string> = {
    pdf: "pdf",
    excel: "xlsx",
};

/** Downloads the PDF/Excel report as a blob (auth header required, so no plain <a href>). */
export const exportReportApi = async (q: ExportReportQuery): Promise<void> => {
    const response = await axiosInstance.get("/v1/reports/export", {
        params: { ...buildParams(q), format: q.format, reportType: q.reportType },
        responseType: "blob",
    });

    const blob = new Blob([response.data], {
        type: response.headers["content-type"] ?? EXPORT_MIME[q.format],
    });

    // Prefer the server-provided filename, else build a readable default.
    let filename = `report-${q.reportType}-${q.startDate}_${q.endDate}.${EXPORT_EXT[q.format]}`;
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
