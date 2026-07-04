import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getRevenueSummaryApi,
    getMoviePerformanceApi,
    exportReportApi,
} from "@/services/api/report.service";
import type { ReportQuery, ExportReportQuery } from "../types/report.types";
import {
    REVENUE_SUMMARY_QUERY_KEY,
    MOVIE_PERFORMANCE_QUERY_KEY,
} from "../constants/report.constants";
import { notify } from "@/utils/notify";

export function useRevenueSummary(query: ReportQuery, enabled: boolean) {
    return useQuery({
        queryKey: [REVENUE_SUMMARY_QUERY_KEY, query.startDate, query.endDate, query.cinemaId ?? "all"],
        queryFn: () => getRevenueSummaryApi(query),
        enabled,
        staleTime: 60 * 1000,
    });
}

export function useMoviePerformance(query: ReportQuery, enabled: boolean) {
    return useQuery({
        queryKey: [
            MOVIE_PERFORMANCE_QUERY_KEY,
            query.startDate,
            query.endDate,
            query.cinemaId ?? "all",
            query.searchMovie ?? "",
        ],
        queryFn: () => getMoviePerformanceApi(query),
        enabled,
        staleTime: 60 * 1000,
    });
}

export function useExportReport() {
    return useMutation({
        mutationFn: (query: ExportReportQuery) => exportReportApi(query),
        onSuccess: () => {
            notify.success("Export ready", "Your Excel report has been downloaded.");
        },
        onError: () => {
            notify.error("Export failed", "Could not export the report. Please try again.");
        },
    });
}
