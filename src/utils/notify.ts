import { notification } from "antd";
import { createElement } from "react";

notification.config({ top: 84 });

const darkStyle: React.CSSProperties = {
    background: "#1a0f0f",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#ffffff",
};

const msg = (text: string) =>
    createElement("span", { style: { color: "#ffffff", fontWeight: 600 } }, text);

const desc = (text?: string) =>
    text ? createElement("span", { style: { color: "#c8b8b8" } }, text) : undefined;

export const notify = {
    success: (message: string, description?: string) =>
        notification.success({
            message: msg(message),
            description: desc(description),
            style: darkStyle,
            placement: "topRight",
        }),

    error: (message: string, description?: string) =>
        notification.error({
            message: msg(message),
            description: desc(description),
            style: darkStyle,
            placement: "topRight",
        }),

    warning: (message: string, description?: string) =>
        notification.warning({
            message: msg(message),
            description: desc(description),
            style: darkStyle,
            placement: "topRight",
        }),

    info: (message: string, description?: string) =>
        notification.info({
            message: msg(message),
            description: desc(description),
            style: darkStyle,
            placement: "topRight",
        }),
};
