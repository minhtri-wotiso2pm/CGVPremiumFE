import type { Dayjs } from "dayjs";

export interface GenerateWizardState {
    movieId: number | null;
    roomId: number | null;
    showtimeTypeId: number | null;
    /** Required by /preview and /generate — not called out as its own
     *  wizard step in the spec, so it's collected alongside Step 3
     *  (Showtime Type) since that's the step right before any API call
     *  that needs it. */
    basePrice: number | null;
    dateRange: [Dayjs, Dayjs] | null;
}

export const INITIAL_WIZARD_STATE: GenerateWizardState = {
    movieId: null,
    roomId: null,
    showtimeTypeId: null,
    basePrice: null,
    dateRange: null,
};

export const WIZARD_STEPS = [
    { key: 1, label: "Movie" },
    { key: 2, label: "Room" },
    { key: 3, label: "Showtime Type" },
    { key: 4, label: "Date Range" },
    { key: 5, label: "Generate" },
] as const;
