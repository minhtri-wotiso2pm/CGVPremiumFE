export type FnbItemType = "combo" | "snack" | "beverage" | "dessert";
export type FnbItemStatus = "in_stock" | "low_stock" | "out_of_stock" | "inactive";

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
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "inactive", label: "Inactive" },
];

export const FNB_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "inactive", label: "Inactive" },
];

export const FNB_STATUS_LABELS: Record<FnbItemStatus, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
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
    cinemaID: number;
    itemName: string;
    itemType: FnbItemType;
    price: number;
    stockQuantity: number;
    isOnMenu: boolean;
    status: FnbItemStatus;
    isLoyaltyEligible: boolean;

}

export interface FnbProductDetail extends FnbProduct {
    description: string | null;
    imageURL: string | null;
    isLoyaltyEligible: boolean;
    updatedAt: string;
}

export interface FnbProductListResponse {
    products: FnbProduct[];
}

export interface CreateFnbProductPayload {
    itemName: string;
    itemType: FnbItemType;
    description: string | null;
    price: number;
    stockQuantity: number;
    imageURL: string | null;
    isOnMenu: boolean;
    isLoyaltyEligible: boolean;
}

export interface UpdateFnbProductPayload extends CreateFnbProductPayload {
    status: FnbItemStatus;
}

export type FnbModalType = "create" | "edit" | "delete";
