import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
    { required: true, message: "Full name is required" },
    { min: 2, max: 100, message: "Name must be 2–100 characters" },
    { whitespace: true, message: "Name cannot be blank" },
];

export const emailRules: Rule[] = [
    { required: true, message: "Email is required" },
    { type: "email", message: "Enter a valid email address" },
];

export const phoneRules: Rule[] = [
    { required: true, message: "Phone is required" },
    { pattern: /^\+?[0-9]{7,15}$/, message: "Enter a valid phone number" },
];

export const passwordRules: Rule[] = [
    { required: true, message: "Password is required" },
    { min: 8, message: "At least 8 characters" },
    {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=])/,
        message: "Must include uppercase, lowercase, number, and special character",
    },
];

export const roleRules: Rule[] = [
    { required: true, message: "Role is required" },
];

export const statusRules: Rule[] = [
    { required: true, message: "Status is required" },
];

export const cinemaIdRules: Rule[] = [
    { required: true, message: "Cinema ID is required" },
    { type: "number", min: 1, message: "Must be a positive number" },
];

export const confirmPasswordRules = (getFieldValue: (name: string) => string): Rule[] => [
    { required: true, message: "Please confirm your password" },
    {
        validator(_, value) {
            if (!value || getFieldValue("password") === value) return Promise.resolve();
            return Promise.reject(new Error("Passwords do not match"));
        },
    },
];
