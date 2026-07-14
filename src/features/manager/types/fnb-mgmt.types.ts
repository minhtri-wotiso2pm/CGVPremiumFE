export type FnbItemType = "combo" | "snack" | "beverage" | "dessert";
export type FnbItemStatus = "active" | "inactive";

export const FNB_TYPE_OPTIONS: { value: FnbItemType; label: string }[] = [
    { value: "combo", label: "Combo" },
    { value: "snack", label: "Snack" },
    { value: "beverage", label: "Beverage" },
    { value: "dessert", label: "Dessert" },
];

export const FNB_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "All Types" },
    { value: "combo", label: "Combo" },
    { value: "snack", label: "Snack" },
    { value: "beverage", label: "Beverage" },
    { value: "dessert", label: "Dessert" },
];

export const FNB_STATUS_OPTIONS: { value: FnbItemStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const FNB_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const FNB_STATUS_LABELS: Record<FnbItemStatus, string> = {
    active: "Active",
    inactive: "Inactive",
};

export const FNB_TYPE_LABELS: Record<FnbItemType, string> = {
    combo: "Combo",
    snack: "Snack",
    beverage: "Beverage",
    dessert: "Dessert",
};

export interface FnbProduct {
    itemID: number;
    itemName: string;
    itemType: FnbItemType;
    description: string | null;
    price: number;
    status: FnbItemStatus;
    isLoyaltyEligible: boolean;
    imageURL: string | null;
    updatedAt: string;
}

export type FnbProductDetail = FnbProduct;

export interface FnbProductListResponse {
    products: FnbProduct[];
}

export interface CreateFnbProductPayload {
    itemName: string;
    itemType: FnbItemType;
    description: string | null;
    price: number;
    imageURL: string | null;
    isLoyaltyEligible: boolean;
}

export interface UpdateFnbProductPayload extends CreateFnbProductPayload {
    status: FnbItemStatus;
}

export type FnbModalType = "create" | "edit" | "delete";
