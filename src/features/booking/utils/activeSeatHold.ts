/**
 * Tracks the seat hold created for the booking flow currently in progress
 * (Seat Selection → F&B → Payment), so the app can release it via a
 * single, always-mounted popstate listener (see useSeatHoldBackGuard).
 *
 * A listener registered inside FnbPage itself is unreliable: React
 * Router's own popstate listener (registered earlier, at app root) runs
 * first and synchronously unmounts FnbPage as part of the same "popstate"
 * dispatch — which removes FnbPage's listener before its turn to run,
 * so it never fires. Plain module state survives that unmount.
 */
export interface ActiveSeatHold {
    showtimeId: number;
    seatIds: number[];
}

let current: ActiveSeatHold | null = null;

export const setActiveSeatHold = (hold: ActiveSeatHold): void => {
    current = hold;
};

export const clearActiveSeatHold = (): void => {
    current = null;
};

export const getActiveSeatHold = (): ActiveSeatHold | null => current;
