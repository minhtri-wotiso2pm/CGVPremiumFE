export interface ProfileCinema {
    cinemaId: number;
    cinemaName: string;
    address: string;
    status: string;
}

export interface ProfileResponse {
    userID: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarURL: string | null;
    totalPoints: number;
    /** Refund quota for the customer's current membership tier. */
    total_refunds: number;
    /** How many of that quota the customer has already used. */
    used_refunds: number;
    createdAt: string;
    /** Unique membership barcode (e.g. "CV000008") — scannable at the counter. */
    barcode?: string | null;
    cinema?: ProfileCinema | null;
}
export interface UpdateProfilePayload {
    fullName: string;
    phone: string;
}