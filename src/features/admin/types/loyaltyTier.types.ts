export interface LoyaltyTierItem {
    tierID: number;
    tierName: string;
    minPoints: number;
    discountRate: number;
    maxRefundPerMonth: number;
}

export interface LoyaltyTierPayload {
    tierName: string;
    minPoints: number;
    discountRate: number;
    maxRefundPerMonth: number;
}

export type LoyaltyTierModalType = "create" | "edit" | "delete";
