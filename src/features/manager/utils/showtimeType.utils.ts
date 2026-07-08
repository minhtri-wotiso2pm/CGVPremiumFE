import dayjs from "dayjs";

/** Slots are edited as "HH:mm" strings (zero-padded, so lexicographic
 *  sort is also chronological sort) and converted to/from the API's
 *  "HH:mm:ss" format at the service boundary. */

export function sortSlotsAsc(slots: string[]): string[] {
    return [...slots].sort((a, b) => a.localeCompare(b));
}

export function validateSlots(slots: string[]): string | null {
    if (slots.length === 0) return "Add at least one slot.";
    if (slots.some((s) => !s)) return "Every slot needs a time — set a time or remove the empty row.";
    const seen = new Set<string>();
    for (const s of slots) {
        if (seen.has(s)) return `Duplicate slot time: ${s}.`;
        seen.add(s);
    }
    return null;
}

/** "HH:mm" → "HH:mm:ss", sorted ascending — the shape the API expects. */
export function toApiSlots(slots: string[]): string[] {
    return sortSlotsAsc(slots).map((s) => `${s}:00`);
}

/** "HH:mm:ss" → "HH:mm" — the shape the editor works with. */
export function fromApiSlots(slots: string[]): string[] {
    return slots.map((s) => s.slice(0, 5));
}

export function formatSlotShort(slot: string): string {
    return slot.slice(0, 5);
}

export interface LocalPreviewRow {
    slot: string; // "HH:mm"
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
}

/** Client-side-only estimate: EndTime = Slot + Movie Duration + Cleaning
 *  Duration. No API call, no conflict checking — just a quick "here's
 *  roughly what this will look like" while the manager is still picking
 *  a showtime type (see Step 4 for the real, server-validated preview). */
export function computeLocalPreview(
    slots: string[],
    movieDurationMin: number,
    cleaningMin: number,
): LocalPreviewRow[] {
    return sortSlotsAsc(slots.map(formatSlotShort)).map((slot) => {
        const start = dayjs(`2000-01-01 ${slot}`, "YYYY-MM-DD HH:mm");
        const end = start.add(movieDurationMin + cleaningMin, "minute");
        return { slot, start: start.format("HH:mm"), end: end.format("HH:mm") };
    });
}
