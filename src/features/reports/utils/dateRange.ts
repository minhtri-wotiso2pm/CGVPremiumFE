const DAY_MS = 24 * 60 * 60 * 1000;

const toIso = (d: Date): string => d.toISOString().slice(0, 10);

/** The immediately-preceding period of equal length (inclusive), used to
 *  compute real period-over-period trend deltas for the KPI cards
 *  (e.g. current = Jun 1–30 → previous = May 2–31). */
export function getPreviousPeriod(startDate: string, endDate: string): { startDate: string; endDate: string } {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const spanMs = end.getTime() - start.getTime();

    const prevEnd = new Date(start.getTime() - DAY_MS);
    const prevStart = new Date(prevEnd.getTime() - spanMs);

    return { startDate: toIso(prevStart), endDate: toIso(prevEnd) };
}
