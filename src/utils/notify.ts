import { notification } from "antd";
import { createElement } from "react";

notification.config({ top: 84 });

const darkStyle: React.CSSProperties = {
    background: "#1a0f0f",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    cursor: "pointer",
};

const msg = (text: string) =>
    createElement("span", { style: { color: "#ffffff", fontWeight: 600 } }, text);

const desc = (text?: string) =>
    text ? createElement("span", { style: { color: "#c8b8b8" } }, text) : undefined;

let counter = 0;

const open = (type: "success" | "error" | "warning" | "info", message: string, description?: string) => {
    const key = `notify-${++counter}`;
    notification[type]({
        key,
        message: msg(message),
        description: desc(description),
        style: darkStyle,
        placement: "topRight",
        onClick: () => notification.destroy(key),
    });
};

export const notify = {
    success: (message: string, description?: string) => open("success", message, description),
    error:   (message: string, description?: string) => open("error",   message, description),
    warning: (message: string, description?: string) => open("warning", message, description),
    info:    (message: string, description?: string) => open("info",    message, description),
};
