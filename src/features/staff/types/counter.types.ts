import type { Seat } from "@/features/booking/types/seat.types";
import type { BookingResponse } from "@/features/booking/types/payment.types";
import type { LookedUpMember } from "./lookup.types";

/** Counter sales support two order kinds (see FLOW spec §1). */
export type CounterMode = "TICKET_FNB" | "FNB_ONLY";

/**
 * Steps in visit order. "mode" is the initial full-screen chooser; the rest
 * form the stepper. TICKET_FNB visits all of them, FNB_ONLY skips
 * showtime + seats.
 */
export type CounterStep = "mode" | "showtime" | "seats" | "fnb" | "customer" | "payment";

/** One selected F&B line — carries name/price so the Order Rail is self-sufficient. */
export interface CounterFnbLine {
    itemId: number;
    name: string;
    unitPrice: number;
    quantity: number;
}

/** The showtime chosen at the counter (flattened from the showtimes API). */
export interface CounterShowtime {
    showtimeId: number;
    movieId: number;
    movieTitle: string;
    moviePoster: string | null;
    startTime: string;
    endTime?: string;
    roomId: number;
    roomName: string;
    roomType: string;
    cinemaId: number;
    cinemaName: string;
}

/**
 * Who the order is for. `null` member = Guest (no points / wallet / voucher).
 * `resolved` flips true once the staff has explicitly chosen Guest or a member,
 * which is what unlocks the payment step.
 */
export interface CounterCustomer {
    member: LookedUpMember | null;
    resolved: boolean;
}

export interface CounterState {
    mode: CounterMode | null;
    step: CounterStep;
    showtime: CounterShowtime | null;
    selectedSeats: Seat[];
    hold: { holdIds: number[]; expiresAt: string } | null;
    /** itemId → line */
    fnb: Map<number, CounterFnbLine>;
    customer: CounterCustomer;
    /** Reserved for when the BE returns a member's vouchers; unused for now. */
    voucherCode: string | null;
}

export type CounterPaymentMethod = "cash" | "wallet" | "payos";

/** Everything the receipt screen needs after a successful payment. */
export interface CounterReceipt {
    booking: BookingResponse;
    paymentMethod: CounterPaymentMethod;
    amountPaid: number;
    /** Cash only — what the customer handed over and their change. */
    cashReceived?: number;
    change?: number;
    memberName: string | null;
    hasFnb: boolean;
}
