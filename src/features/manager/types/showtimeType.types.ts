/** GET /showtime-types (list) — slots are plain time strings. */
export interface ShowtimeTypeListItem {
    id: number;
    cinemaId: number;
    name: string;
    isActive: boolean;
    slots: string[]; // "HH:mm:ss"
}

export interface ShowtimeTypeListResponse {
    items: ShowtimeTypeListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/** GET /showtime-types/{id} — slots are objects (each has its own id,
 *  needed so edits can be tracked/diffed by the backend). */
export interface ShowtimeTypeSlot {
    id: number;
    startTime: string; // "HH:mm:ss"
}

export interface ShowtimeTypeDetail {
    id: number;
    cinemaId: number;
    name: string;
    isActive: boolean;
    slots: ShowtimeTypeSlot[];
}

export interface GetShowtimeTypesParams {
    cinemaId?: number;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
}

export interface CreateShowtimeTypePayload {
    cinemaId: number;
    name: string;
    slots: string[]; // "HH:mm:ss"
}

export interface UpdateShowtimeTypePayload {
    name: string;
    isActive: boolean;
    slots: string[];
}

export interface MutateShowtimeTypeResponse {
    success: boolean;
    id: number;
    message: string;
}

export type ShowtimeTypeModalType = "create" | "edit" | "clone" | "delete";

/* ── Preview / Generate (shared request shape) ── */
export interface ShowtimeTypePreviewRequest {
    movieId: number;
    roomId: number;
    startDate: string; // yyyy-MM-dd
    endDate: string;   // yyyy-MM-dd
    showtimeTypeId: number;
    basePrice: number;
}

export interface ShowtimeTypePreviewItem {
    date: string;       // yyyy-MM-dd
    startTime: string;  // ISO with offset
    endTime: string;    // ISO with offset
    isConflict: boolean;
    reason: string | null;
}

export interface ShowtimeTypePreviewResponse {
    items: ShowtimeTypePreviewItem[];
    validCount: number;
    conflictCount: number;
}

export interface ShowtimeTypeGenerateItem {
    startTime: string;
    endTime: string;
    status: "generated" | "skipped" | string;
    reason: string | null;
}

export interface ShowtimeTypeGenerateResponse {
    success: boolean;
    generatedCount: number;
    skippedCount: number;
    items: ShowtimeTypeGenerateItem[];
}
