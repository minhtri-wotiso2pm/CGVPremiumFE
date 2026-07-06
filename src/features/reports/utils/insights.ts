import type { MoviePerformanceRow, RevenueSummary, TopSelling } from "../types/report.types";

export interface Insight {
    key: string;
    label: string;
    value: string;
    sub?: string;
}

const maxBy = <T,>(items: T[], select: (item: T) => number): T | null =>
    items.reduce<T | null>((best, item) => (best === null || select(item) > select(best) ? item : best), null);

/** All derived purely from data already returned by the 3 report endpoints
 *  — no fabricated numbers. Renders an empty list when there's nothing to
 *  compute from (e.g. no bookings in the selected period). */
export function computeInsights(
    summary: RevenueSummary | undefined,
    movies: MoviePerformanceRow[],
    topSelling: TopSelling | undefined,
): Insight[] {
    const insights: Insight[] = [];
    if (!summary) return insights;

    const topRevenueMovie = maxBy(movies, (m) => m.revenue);
    if (topRevenueMovie) {
        insights.push({
            key: "top-revenue-movie",
            label: "Highest Revenue Movie",
            value: topRevenueMovie.title,
            sub: `${Math.round(topRevenueMovie.revenue).toLocaleString("vi-VN")} ₫`,
        });
    }

    const topOccupancyMovie = maxBy(movies, (m) => m.occupancyRate);
    if (topOccupancyMovie) {
        insights.push({
            key: "top-occupancy-movie",
            label: "Highest Occupancy",
            value: topOccupancyMovie.title,
            sub: `${topOccupancyMovie.occupancyRate.toFixed(1)}%`,
        });
    }

    const topCinema = maxBy(topSelling?.cinemas ?? [], (c) => c.ticketsSold);
    if (topCinema) {
        insights.push({
            key: "top-cinema",
            label: "Best Selling Cinema",
            value: topCinema.cinemaName,
            sub: `${topCinema.ticketsSold.toLocaleString("vi-VN")} tickets`,
        });
    }

    const fnbProducts = topSelling?.fnbProducts ?? [];
    const combos = fnbProducts.filter((p) => p.productName.toLowerCase().includes("combo"));
    const topFnb = maxBy(combos.length > 0 ? combos : fnbProducts, (p) => p.quantitySold);
    if (topFnb) {
        insights.push({
            key: "top-fnb",
            label: combos.length > 0 ? "Best Selling Combo" : "Best Selling F&B Item",
            value: topFnb.productName,
            sub: `${topFnb.quantitySold.toLocaleString("vi-VN")} sold`,
        });
    }

    if (summary.ticketsSold > 0) {
        insights.push({
            key: "avg-ticket-revenue",
            label: "Average Ticket Revenue",
            value: `${Math.round(summary.ticketRevenue / summary.ticketsSold).toLocaleString("vi-VN")} ₫`,
        });
    }

    if (summary.bookingCount > 0) {
        insights.push({
            key: "avg-fnb-revenue",
            label: "Average F&B Revenue",
            value: `${Math.round(summary.fnbRevenue / summary.bookingCount).toLocaleString("vi-VN")} ₫`,
            sub: "per booking",
        });
    }

    if (summary.grossRevenue > 0) {
        const ticketPct = (summary.ticketRevenue / summary.grossRevenue) * 100;
        const fnbPct = (summary.fnbRevenue / summary.grossRevenue) * 100;
        insights.push({
            key: "revenue-ratio",
            label: "Ticket vs F&B Revenue",
            value: `${ticketPct.toFixed(0)}% / ${fnbPct.toFixed(0)}%`,
        });
    }

    if (summary.bookingCount > 0) {
        insights.push({
            key: "tickets-per-booking",
            label: "Tickets per Booking",
            value: (summary.ticketsSold / summary.bookingCount).toFixed(1),
        });

        insights.push({
            key: "revenue-per-booking",
            label: "Revenue per Booking",
            value: `${Math.round(summary.grossRevenue / summary.bookingCount).toLocaleString("vi-VN")} ₫`,
        });
    }

    return insights;
}
