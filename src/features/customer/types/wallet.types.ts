export type WalletTransactionType = "payment" | "refund" | "top_up";

export interface WalletSummary {
    currentBalance: number;
    totalRefundReceived: number;
    totalSpent: number;
    transactionCount: number;
}

export interface WalletTransaction {
    transactionID: number;
    transactionType: WalletTransactionType | string;
    amount: number;
    balanceAfter: number;
    bookingCode: string | null;
    description: string | null;
    createdAt: string;
}

export interface WalletTransactionDetail extends WalletTransaction {
    refundID: number | null;
}

export interface WalletTransactionListResponse {
    transactions: WalletTransaction[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface WalletTransactionFilters {
    page: number;
    pageSize: number;
    fromDate?: string;
    toDate?: string;
    transactionType?: WalletTransactionType;
}
