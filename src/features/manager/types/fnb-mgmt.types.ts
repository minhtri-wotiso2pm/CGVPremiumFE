export type FnbItemType = "combo" | "snack" | "beverage" | "dessert";
export type FnbItemStatus = "in_stock" | "low_stock" | "out_of_stock" | "inactive";

export const FNB_TYPE_OPTIONS: { value: FnbItemType; label: string }[] = [
    { value: "combo", label: "Combo" },
    { value: "snack", label: "Snack" },
    { value: "beverage", label: "Đồ uống" },
    { value: "dessert", label: "Tráng miệng" },
];

export const FNB_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "Tất cả loại" },
    { value: "combo", label: "Combo" },
    { value: "snack", label: "Snack" },
    { value: "beverage", label: "Đồ uống" },
    { value: "dessert", label: "Tráng miệng" },
];

export const FNB_STATUS_OPTIONS: { value: FnbItemStatus; label: string }[] = [
    { value: "in_stock", label: "Còn hàng" },
    { value: "low_stock", label: "Sắp hết" },
    { value: "out_of_stock", label: "Hết hàng" },
    { value: "inactive", label: "Ngừng bán" },
];

export const FNB_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "in_stock", label: "Còn hàng" },
    { value: "low_stock", label: "Sắp hết" },
    { value: "out_of_stock", label: "Hết hàng" },
    { value: "inactive", label: "Ngừng bán" },
];

export const FNB_STATUS_LABELS: Record<FnbItemStatus, string> = {
    in_stock: "Còn hàng",
    low_stock: "Sắp hết",
    out_of_stock: "Hết hàng",
    inactive: "Ngừng bán",
};

export const FNB_TYPE_LABELS: Record<FnbItemType, string> = {
    combo: "Combo",
    snack: "Snack",
    beverage: "Đồ uống",
    dessert: "Tráng miệng",
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
