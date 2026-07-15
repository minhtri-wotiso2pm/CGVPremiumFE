import { type FC } from "react";
import type { DeliveryStatus } from "../types/emailLog.types";

const STATUS_CLASS: Record<DeliveryStatus, string> = {
    sent:    "dash-badge--active",
    queued:  "dash-badge--pending",
    sending: "dash-badge--pending",
    failed:  "dash-badge--banned",
    skipped: "dash-badge--inactive",
};

const STATUS_LABEL: Record<DeliveryStatus, string> = {
    sent: "Sent",
    queued: "Queued",
    sending: "Sending",
    failed: "Failed",
    skipped: "Skipped",
};

export const DeliveryStatusBadge: FC<{ status: DeliveryStatus }> = ({ status }) => (
    <span className={`dash-badge ${STATUS_CLASS[status] ?? "dash-badge--inactive"}`}>
        {STATUS_LABEL[status] ?? status}
    </span>
);
