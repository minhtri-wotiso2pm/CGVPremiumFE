/**
 * F&B pickup at the counter — a two-step flow:
 *   1. POST /api/bookings/lookup  (read-only)  → show the order + its F&B items
 *   2. POST /api/checkins/fnb-pickup           → mark every F&B item picked up
 *
 * Works for both order kinds since both carry a bookingCode: tickets+F&B orders
 * placed online and F&B-only orders created at the counter.
 */

export interface PickupFnbItem {
    itemId: number;
    itemName: string;
    quantity: number;
    /** Current pickup state — guards against handing the same order over twice. */
    pickedUp: boolean;
    /** Product thumbnail so staff can match the item by sight, not just name. */
    imageURL?: string | null;
}

export interface BookingLookupResult {
    bookingId: number;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    customerAvatarURL?: string | null;
    paymentStatus: string;
    totalAmount: number;
    fnbItems: PickupFnbItem[];
}

export interface BookingLookupResponse {
    success: boolean;
    message: string;
    data: BookingLookupResult | null;
}

export interface FnbPickupResponse {
    success: boolean;
    message: string;
}

/* ── Pickup history (GET /api/checkins/fnb-pickup-history) ── */

export interface FnbPickupHistoryItem {
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface FnbPickupHistoryRecord {
    bookingId: number;
    bookingCode: string;
    customerName: string;
    cinemaName: string;
    pickedUpAt: string;
    staffName: string;
    totalAmount: number;
    items: FnbPickupHistoryItem[];
}

export interface FnbPickupHistoryQuery {
    staffId: number;
    cinemaId: number;
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
}

export interface FnbPickupHistoryData {
    records: FnbPickupHistoryRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface FnbPickupHistoryResponse {
    success: boolean;
    data: FnbPickupHistoryData;
}
