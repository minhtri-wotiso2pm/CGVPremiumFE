const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getTodayString(): string {
    const d = new Date();
    return toDateParam(d);
}

export function toDateParam(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function generateDateRange(count: number): Date[] {
    return Array.from({ length: count }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + i);
        return d;
    });
}

export function getDateLabel(date: Date, index: number) {
    return {
        day: index === 0 ? "Today" : DAY_LABELS[date.getDay()],
        num: date.getDate(),
        month: MONTH_LABELS[date.getMonth()],
    };
}

export function formatShowtime(startTime: string): string {
    const d = new Date(startTime);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function isShowtimePast(startTime: string): boolean {
    return new Date(startTime) < new Date();
}

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
