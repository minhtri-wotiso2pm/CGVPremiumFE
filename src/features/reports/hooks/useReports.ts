import { useMemo } from "react";
import { useMutation, useQuery, useQueries } from "@tanstack/react-query";
import {
    getRevenueSummaryApi,
    getMoviePerformanceApi,
    getTopSellingApi,
    getRevenueTimeseriesApi,
    exportReportApi,
} from "@/services/api/report.service";
import type { ReportQuery, ExportReportQuery, RevenueSummary, RevenueTimeseriesQuery } from "../types/report.types";
import {
    REVENUE_SUMMARY_QUERY_KEY,
    MOVIE_PERFORMANCE_QUERY_KEY,
    TOP_SELLING_QUERY_KEY,
    REVENUE_TIMESERIES_QUERY_KEY,
} from "../constants/report.constants";
import { getPreviousPeriod } from "../utils/dateRange";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

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

export function useTopSelling(query: ReportQuery, enabled: boolean) {
    return useQuery({
        queryKey: [TOP_SELLING_QUERY_KEY, query.startDate, query.endDate, query.cinemaId ?? "all"],
        queryFn: () => getTopSellingApi(query),
        enabled,
        staleTime: 60 * 1000,
    });
}

export function useRevenueTimeseries(query: RevenueTimeseriesQuery, enabled: boolean) {
    return useQuery({
        queryKey: [REVENUE_TIMESERIES_QUERY_KEY, query.startDate, query.endDate, query.groupBy],
        queryFn: () => getRevenueTimeseriesApi(query),
        enabled,
        staleTime: 60 * 1000,
    });
}

export interface RevenueTrendDelta {
    /** Percentage change vs the immediately-preceding period of equal
     *  length. `null` when the previous period had no baseline (0) to
     *  compare against, so the UI can omit the arrow instead of showing
     *  a misleading "+Infinity%". */
    grossRevenue: number | null;
    ticketRevenue: number | null;
    fnbRevenue: number | null;
    discountAmount: number | null;
    bookingCount: number | null;
    ticketsSold: number | null;
    averageOrderValue: number | null;
}

const pctDelta = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
};

/** Fetches the current period's revenue summary plus the immediately
 *  preceding period of equal length, and derives real % deltas per
 *  metric for the KPI cards' trend arrows. */
export function useRevenueTrend(query: ReportQuery, enabled: boolean) {
    const previousRange = useMemo(
        () => getPreviousPeriod(query.startDate, query.endDate),
        [query.startDate, query.endDate],
    );

    const [currentQ, previousQ] = useQueries({
        queries: [
            {
                queryKey: [REVENUE_SUMMARY_QUERY_KEY, query.startDate, query.endDate, query.cinemaId ?? "all"],
                queryFn: () => getRevenueSummaryApi(query),
                enabled,
                staleTime: 60 * 1000,
            },
            {
                queryKey: [
                    REVENUE_SUMMARY_QUERY_KEY,
                    previousRange.startDate,
                    previousRange.endDate,
                    query.cinemaId ?? "all",
                ],
                queryFn: () => getRevenueSummaryApi({ ...query, ...previousRange }),
                enabled,
                staleTime: 60 * 1000,
            },
        ],
    });

    const deltas: RevenueTrendDelta | undefined = useMemo(() => {
        const current = currentQ.data;
        const previous = previousQ.data;
        if (!current || !previous) return undefined;
        return {
            grossRevenue: pctDelta(current.grossRevenue, previous.grossRevenue),
            ticketRevenue: pctDelta(current.ticketRevenue, previous.ticketRevenue),
            fnbRevenue: pctDelta(current.fnbRevenue, previous.fnbRevenue),
            discountAmount: pctDelta(current.discountAmount, previous.discountAmount),
            bookingCount: pctDelta(current.bookingCount, previous.bookingCount),
            ticketsSold: pctDelta(current.ticketsSold, previous.ticketsSold),
            averageOrderValue: pctDelta(current.averageOrderValue, previous.averageOrderValue),
        };
    }, [currentQ.data, previousQ.data]);

    return {
        summary: currentQ.data as RevenueSummary | undefined,
        deltas,
        isLoading: currentQ.isFetching || previousQ.isFetching,
        isError: currentQ.isError,
        refetch: currentQ.refetch,
    };
}

export function useExportReport() {
    return useMutation({
        mutationFn: (query: ExportReportQuery) => exportReportApi(query),
        onSuccess: () => {
            notify.success("Export ready", "Your report has been downloaded.");
        },
        onError: (err: unknown) => {
            notify.error("Export failed", getApiErrorMessage(err, "Could not export the report. Please try again."));
        },
    });
}
