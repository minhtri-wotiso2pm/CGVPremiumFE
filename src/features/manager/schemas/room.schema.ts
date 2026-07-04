import type { Rule } from "antd/es/form";

export const roomNameRules: Rule[] = [
    { required: true, message: "Room name is required" },
    { whitespace: true, message: "Room name cannot be blank" },
    { max: 100, message: "Maximum 100 characters" },
];

export const roomTypeRules: Rule[] = [
    { required: true, message: "Please select a room type" },
];

export const roomStatusRules: Rule[] = [
    { required: true, message: "Please select a status" },
];

export const roomDescriptionRules: Rule[] = [
    { max: 250, message: "Maximum 250 characters" },
];

/* ─── Seat type ─── */
export const seatTypeNameRules: Rule[] = [
    { required: true, message: "Type name is required" },
    { whitespace: true, message: "Type name cannot be blank" },
    { max: 50, message: "Maximum 50 characters" },
];

export const seatTypeCapacityRules: Rule[] = [
    { required: true, message: "Capacity is required" },
    { type: "number", min: 1, max: 10, message: "Capacity must be between 1 and 10" },
];

export const seatTypeExtraPriceRules: Rule[] = [
    { required: true, message: "Extra price is required" },
    { type: "number", min: 0, message: "Extra price cannot be negative" },
];
