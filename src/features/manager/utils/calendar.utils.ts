import type { ManagerShowtime } from "../types/showtime-mgmt.types";

export function groupByDate(items: ManagerShowtime[]): Map<string, ManagerShowtime[]> {
    const map = new Map<string, ManagerShowtime[]>();
    for (const s of items) {
        const date = s.startTime.slice(0, 10);
        if (!map.has(date)) map.set(date, []);
        map.get(date)!.push(s);
    }
    for (const list of map.values()) {
        list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
}
