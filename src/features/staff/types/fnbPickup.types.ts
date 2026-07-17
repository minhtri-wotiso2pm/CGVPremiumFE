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
}

export interface BookingLookupResult {
    bookingId: number;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
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
