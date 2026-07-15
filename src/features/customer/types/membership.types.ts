export interface MembershipInfo {
    currentTier: string;
    nextTier: string | null;
    pointsToNextTier: number | null;
    totalPoints: number;
    totalSpent: number;
    discountPercent: number;
}

export interface MembershipTier {
    tierID: number;
    tierName: string;
    minPoints: number;
    discountRate: number;
    /** Refund quota granted to members at this tier. */
    total_refunds: number;
}

export interface PointsHistoryEntry {
    pointsDelta: number;
    transactionType: "earn" | "redeem" | string;
    description: string;
    createdAt: string;
}
