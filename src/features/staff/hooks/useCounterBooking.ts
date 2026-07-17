import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useReleaseSeatHold } from "@/features/booking/hooks/useSeatHold";
import type { Seat } from "@/features/booking/types/seat.types";
import type { LookedUpMember } from "../types/lookup.types";
import type {
    CounterFnbLine,
    CounterMode,
    CounterShowtime,
    CounterState,
    CounterStep,
} from "../types/counter.types";

const INITIAL: CounterState = {
    mode: null,
    step: "mode",
    showtime: null,
    selectedSeats: [],
    hold: null,
    fnb: new Map(),
    customer: { member: null, resolved: false },
    voucherCode: null,
};

/** Step sequence per mode (the stepper; "mode" is the pre-stepper chooser). */
export const STEPS_BY_MODE: Record<CounterMode, CounterStep[]> = {
    TICKET_FNB: ["showtime", "seats", "fnb", "customer", "payment"],
    FNB_ONLY: ["fnb", "customer", "payment"],
};

/* ── Session persistence ──────────────────────────────────────────────
   Keep an in-progress order alive across an accidental refresh (F5). Scoped
   to sessionStorage so it lives only for this tab/session. The `fnb` Map is
   serialized as entries. Note: the seat hold is intentionally NOT released on
   refresh (no beforeunload handler) — the server-side hold TTL covers real
   abandonment, and effect cleanups don't run on a full reload. */
const STORAGE_KEY = "counter-booking-state";

function persist(state: CounterState): void {
    try {
        if (state.step === "mode") {
            sessionStorage.removeItem(STORAGE_KEY);
            return;
        }
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...state, fnb: Array.from(state.fnb.entries()) }),
        );
    } catch { /* storage full / unavailable — non-fatal */ }
}

function loadPersisted(): CounterState {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...INITIAL, fnb: new Map() };
        const parsed = JSON.parse(raw) as Omit<CounterState, "fnb"> & { fnb: [number, CounterFnbLine][] };
        if (!parsed.mode || parsed.step === "mode") return { ...INITIAL, fnb: new Map() };
        return { ...parsed, fnb: new Map(parsed.fnb ?? []) };
    } catch {
        return { ...INITIAL, fnb: new Map() };
    }
}

function clearPersisted(): void {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* non-fatal */ }
}

type Action =
    | { type: "SELECT_MODE"; mode: CounterMode }
    | { type: "SET_STEP"; step: CounterStep }
    | { type: "SET_SHOWTIME"; showtime: CounterShowtime }
    | { type: "SET_SEATS"; seats: Seat[] }
    | { type: "SET_HOLD"; hold: { holdIds: number[]; expiresAt: string } | null }
    | { type: "ADD_FNB"; itemId: number; name: string; unitPrice: number }
    | { type: "DEC_FNB"; itemId: number }
    | { type: "REMOVE_FNB"; itemId: number }
    | { type: "SET_MEMBER"; member: LookedUpMember }
    | { type: "SET_GUEST" }
    | { type: "SET_VOUCHER"; voucherCode: string | null }
    | { type: "RESET" };

function reducer(state: CounterState, action: Action): CounterState {
    switch (action.type) {
        case "SELECT_MODE": {
            const firstStep = STEPS_BY_MODE[action.mode][0];
            return { ...INITIAL, fnb: new Map(), mode: action.mode, step: firstStep };
        }
        case "SET_STEP":
            return { ...state, step: action.step };
        case "SET_SHOWTIME":
            // Changing showtime invalidates any seat selection/hold made against the old one.
            return { ...state, showtime: action.showtime, selectedSeats: [], hold: null };
        case "SET_SEATS":
            return { ...state, selectedSeats: action.seats };
        case "SET_HOLD":
            return { ...state, hold: action.hold };
        case "ADD_FNB": {
            const next = new Map(state.fnb);
            const cur = next.get(action.itemId);
            next.set(action.itemId, {
                itemId: action.itemId,
                name: action.name,
                unitPrice: action.unitPrice,
                quantity: (cur?.quantity ?? 0) + 1,
            });
            return { ...state, fnb: next };
        }
        case "DEC_FNB": {
            const next = new Map(state.fnb);
            const cur = next.get(action.itemId);
            if (!cur) return state;
            if (cur.quantity <= 1) next.delete(action.itemId);
            else next.set(action.itemId, { ...cur, quantity: cur.quantity - 1 });
            return { ...state, fnb: next };
        }
        case "REMOVE_FNB": {
            const next = new Map(state.fnb);
            next.delete(action.itemId);
            return { ...state, fnb: next };
        }
        case "SET_MEMBER":
            // A different member invalidates any voucher picked for the previous one.
            return { ...state, customer: { member: action.member, resolved: true }, voucherCode: null };
        case "SET_GUEST":
            return { ...state, customer: { member: null, resolved: true }, voucherCode: null };
        case "SET_VOUCHER":
            return { ...state, voucherCode: action.voucherCode };
        case "RESET":
            return { ...INITIAL, fnb: new Map() };
        default:
            return state;
    }
}

export function useCounterBooking() {
    const [state, dispatch] = useReducer(reducer, undefined, loadPersisted);
    const { mutate: releaseSeatHold } = useReleaseSeatHold();

    // Mirror every state change to sessionStorage so a refresh restores the
    // in-progress order at the same step.
    useEffect(() => { persist(state); }, [state]);

    // Mirror the live hold in a ref so cleanup (unmount / tab close) can reach
    // it without re-subscribing effects on every render.
    const holdRef = useRef<{ showtimeId: number; seatIds: number[] } | null>(null);
    useEffect(() => {
        holdRef.current =
            state.hold && state.showtime
                ? { showtimeId: state.showtime.showtimeId, seatIds: state.selectedSeats.map((s) => s.seatId) }
                : null;
    }, [state.hold, state.showtime, state.selectedSeats]);

    const releaseCurrentHold = useCallback(() => {
        const h = holdRef.current;
        if (h && h.seatIds.length > 0) {
            releaseSeatHold(h);
            holdRef.current = null;
        }
    }, [releaseSeatHold]);

    // Release the hold when the staff genuinely leaves the counter (SPA route
    // change unmounts this hook). Deliberately NOT on beforeunload: a full
    // refresh would otherwise drop the hold we're trying to preserve, and
    // effect cleanups don't run on reload anyway.
    useEffect(() => {
        return () => releaseCurrentHold();
    }, [releaseCurrentHold]);

    /* ── Derived ── */
    const steps = useMemo(() => (state.mode ? STEPS_BY_MODE[state.mode] : []), [state.mode]);
    const seatIds = useMemo(() => state.selectedSeats.map((s) => s.seatId), [state.selectedSeats]);

    const seatsSubtotal = useMemo(
        () => state.selectedSeats.reduce((sum, s) => sum + (s.price ?? 0), 0),
        [state.selectedSeats],
    );
    const fnbSubtotal = useMemo(() => {
        let total = 0;
        for (const line of state.fnb.values()) total += line.unitPrice * line.quantity;
        return total;
    }, [state.fnb]);
    const estimatedTotal = seatsSubtotal + fnbSubtotal;

    const fnbLines = useMemo<CounterFnbLine[]>(() => Array.from(state.fnb.values()), [state.fnb]);
    const fnbCount = useMemo(() => fnbLines.reduce((s, l) => s + l.quantity, 0), [fnbLines]);

    /** Whether a step's exit condition is met (drives "Next" + stepper back-nav). */
    const isStepComplete = useCallback(
        (step: CounterStep): boolean => {
            switch (step) {
                case "showtime":
                    return !!state.showtime;
                case "seats":
                    return seatIds.length > 0 && !!state.hold;
                case "fnb":
                    // F&B is optional alongside tickets, but required for an F&B-only order.
                    return state.mode === "FNB_ONLY" ? fnbCount > 0 : true;
                case "customer":
                    return state.customer.resolved;
                case "payment":
                    return false; // terminal
                default:
                    return true;
            }
        },
        [state.showtime, state.hold, state.customer.resolved, state.mode, seatIds.length, fnbCount],
    );

    /** A step is reachable via the stepper if every earlier step is complete. */
    const canAccessStep = useCallback(
        (step: CounterStep): boolean => {
            const idx = steps.indexOf(step);
            if (idx <= 0) return idx === 0;
            return steps.slice(0, idx).every(isStepComplete);
        },
        [steps, isStepComplete],
    );

    /* ── Actions ── */
    const selectMode = useCallback((mode: CounterMode) => dispatch({ type: "SELECT_MODE", mode }), []);
    const goToStep = useCallback((step: CounterStep) => dispatch({ type: "SET_STEP", step }), []);

    const goNext = useCallback(() => {
        const idx = steps.indexOf(state.step);
        if (idx >= 0 && idx < steps.length - 1) dispatch({ type: "SET_STEP", step: steps[idx + 1] });
    }, [steps, state.step]);

    const goBack = useCallback(() => {
        const idx = steps.indexOf(state.step);
        if (idx > 0) {
            dispatch({ type: "SET_STEP", step: steps[idx - 1] });
        } else {
            // Back out of the first step → return to the mode chooser, dropping any hold.
            releaseCurrentHold();
            dispatch({ type: "RESET" });
        }
    }, [steps, state.step, releaseCurrentHold]);

    const setShowtime = useCallback(
        (showtime: CounterShowtime) => {
            // Switching showtime abandons the previous hold.
            releaseCurrentHold();
            dispatch({ type: "SET_SHOWTIME", showtime });
        },
        [releaseCurrentHold],
    );
    const setSeats = useCallback((seats: Seat[]) => dispatch({ type: "SET_SEATS", seats }), []);
    const setHold = useCallback(
        (hold: { holdIds: number[]; expiresAt: string } | null) => dispatch({ type: "SET_HOLD", hold }),
        [],
    );

    const addFnb = useCallback(
        (itemId: number, name: string, unitPrice: number) =>
            dispatch({ type: "ADD_FNB", itemId, name, unitPrice }),
        [],
    );
    const decFnb = useCallback((itemId: number) => dispatch({ type: "DEC_FNB", itemId }), []);
    const removeFnb = useCallback((itemId: number) => dispatch({ type: "REMOVE_FNB", itemId }), []);

    const setMember = useCallback((member: LookedUpMember) => dispatch({ type: "SET_MEMBER", member }), []);
    const setGuest = useCallback(() => dispatch({ type: "SET_GUEST" }), []);
    const setVoucher = useCallback((voucherCode: string | null) => dispatch({ type: "SET_VOUCHER", voucherCode }), []);

    const reset = useCallback(() => {
        releaseCurrentHold();
        clearPersisted();
        dispatch({ type: "RESET" });
    }, [releaseCurrentHold]);

    /** Called after a successful payment: the seats are now booked (not held),
     *  so drop the hold WITHOUT releasing it, and clear the saved order. */
    const finalize = useCallback(() => {
        holdRef.current = null;
        clearPersisted();
        dispatch({ type: "RESET" });
    }, []);

    return {
        state,
        steps,
        seatIds,
        seatsSubtotal,
        fnbSubtotal,
        estimatedTotal,
        fnbLines,
        fnbCount,
        isStepComplete,
        canAccessStep,
        // actions
        selectMode,
        goToStep,
        goNext,
        goBack,
        setShowtime,
        setSeats,
        setHold,
        addFnb,
        decFnb,
        removeFnb,
        setMember,
        setGuest,
        setVoucher,
        reset,
        finalize,
        releaseCurrentHold,
    };
}

export type CounterBooking = ReturnType<typeof useCounterBooking>;
