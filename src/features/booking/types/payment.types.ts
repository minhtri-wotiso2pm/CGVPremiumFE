export interface PricingRequest {
    customerId: null;
    showtimeId: number;
    seatIds: number[];
    fnbItems: { itemId: number; quantity: number }[];
    voucherCode: string | null;
}

export interface SeatPricingDetail {
    seatId: number;
    seatRow: string;
    seatCol: number;
    seatTypeName: string;
    price: number;
}

export interface FnbPricingDetail {
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface VoucherDetails {
    voucherCode: string;
    discountType: string;
    discountValue: number;
}

export interface PricingResponse {
    seatsSubTotal: number;
    fnBSubTotal: number;
    totalBeforeDiscount: number;
    membershipDiscount: number;
    voucherDiscount: number;
    totalDiscount: number;
    finalAmount: number;
    seatDetails: SeatPricingDetail[];
    fnBDetails: FnbPricingDetail[];
    voucherDetails: VoucherDetails | null;
}

export interface CreateBookingRequest {
    customerId: null;
    showtimeId: number;
    seatIds: number[];
    fnbItems: { itemId: number; quantity: number }[];
    voucherCode: string | null;
}

export interface BookingSeat {
    seatID: number;
    seatRow: string;
    seatCol: number;
    ticketPrice: number;
}

export interface BookingFnbItem {
    itemName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface BookingResponse {
    bookingID: number;
    bookingCode: string;
    showtimeID: number;
    movieTitle: string;
    startTime: string;
    cinemaName: string;
    roomName: string;
    subTotal: number;
    discountAmount: number;
    finalAmount: number;
    status: string;
    bookingDate: string;
    seats: BookingSeat[];
    fnbItems: BookingFnbItem[];
    voucherApplied: string | null;
}

export interface PaymentInitiateRequest {
    bookingId: number;
    paymentMethod: "payos" | "wallet";
}

export interface PaymentInitiateResponse {
    success: boolean;
    paymentId: number;
    bookingId: number;
    paymentMethod: string;
    amount: number;
    status: string;
    /** PayOS — URL chuyển hướng để thanh toán */
    checkoutUrl?: string;
    /** PayOS — dữ liệu QR code dạng string */
    qrCode?: string;
    paymentLinkId?: string;
    orderCode?: number;
    sessionId: number;
    expiresAt: string;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

export interface PaymentStatusResponse {
    paymentId?: number;
    bookingId?: number;
    status: PaymentStatus;
    amount?: number;
    paymentMethod?: string;
    paidAt?: string;
    createdAt?: string;
}

export interface WalletResponse {
    walletId: number;
    balance: number;
}

export interface BookingConfirmationNavState {
    booking: BookingResponse;
    paymentId: number;
    paymentMethod: string;
    moviePoster?: string;
    roomType?: string;
}
