import type { Seat, SeatNavState } from "./seat.types";

export interface Product {
    productId: number;
    productName: string;
    itemID: number;
    cinemaID: number;
    itemName: string;
    itemType: string;
    description?: string;
    price: number;
    stockQuantity: number;
    imageURL?: string | null;
    isOnMenu: boolean;
    isLoyaltyEligible?: boolean;
    status: string;
}

export interface ProductsResponse {
    products: Product[];
}

export interface FnbItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface SeatHoldRequest {
    showtimeId: number;
    seatIds: number[];
}

export interface SeatHoldResponse {
    holdIds: number[];
    expiresAt: string;
}

/** State truyền từ SeatSelectionPage → FnbPage */
export interface FnbNavState extends SeatNavState {
    showtimeId: number;
    seatIds: number[];
    selectedSeats: Seat[];
    holdIds: number[];
    holdExpiresAt: string;
}

/** State truyền từ FnbPage → PaymentPage */
export interface PaymentNavState extends FnbNavState {
    fnbItems: FnbItem[];
}

