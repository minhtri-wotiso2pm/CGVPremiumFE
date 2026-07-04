import type { Rule } from "antd/es/form";

export const voucherCodeRules: Rule[] = [
    { required: true, message: "Voucher code is required" },
    { whitespace: true, message: "Voucher code cannot be blank" },
    { max: 40, message: "Maximum 40 characters" },
    { pattern: /^[A-Za-z0-9_-]+$/, message: "Only letters, numbers, - and _ allowed" },
];

export const categoryRules: Rule[] = [
    { required: true, message: "Please select a category" },
];

export const discountTypeRules: Rule[] = [
    { required: true, message: "Please select a discount type" },
];

export const validityRules: Rule[] = [
    { required: true, message: "Please select a validity period" },
];

export const descriptionRules: Rule[] = [
    { max: 250, message: "Maximum 250 characters" },
];
