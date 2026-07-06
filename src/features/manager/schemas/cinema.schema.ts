import type { Rule } from "antd/es/form";

export const cinemaNameRules: Rule[] = [
    { required: true, message: "Cinema name is required" },
    { whitespace: true, message: "Cinema name cannot be blank" },
    { max: 100, message: "Maximum 100 characters" },
];

export const addressRules: Rule[] = [
    { required: true, message: "Address is required" },
    { whitespace: true, message: "Address cannot be blank" },
    { max: 200, message: "Maximum 200 characters" },
];

export const statusRules: Rule[] = [
    { required: true, message: "Please select a status" },
];

export const latitudeRules: Rule[] = [
    { required: true, message: "Latitude is required" },
    { type: "number", min: -90, max: 90, message: "Must be between -90 and 90" },
];

export const longitudeRules: Rule[] = [
    { required: true, message: "Longitude is required" },
    { type: "number", min: -180, max: 180, message: "Must be between -180 and 180" },
];
