import { type FC } from "react";
import { getActionSeverity, type LogSeverity } from "../constants/activityLog.constants";

const SEVERITY_CLASS: Record<LogSeverity, string> = {
    danger:  "dash-badge--banned",
    warning: "dash-badge--pending",
    info:    "dash-badge--active",
    neutral: "dash-badge--inactive",
};

/** Colors an action type by severity — danger (delete/ban), warning
 *  (update), info (create), neutral (view/system) — per the module spec. */
export const ActionTypeBadge: FC<{ actionType: string }> = ({ actionType }) => (
    <span className={`dash-badge ${SEVERITY_CLASS[getActionSeverity(actionType)]}`}>
        {actionType}
    </span>
);

const ROLE_CLASS: Record<string, string> = {
    admin:    "dash-role--admin",
    manager:  "dash-role--manager",
    staff:    "dash-role--staff",
    customer: "dash-role--customer",
};

export const RoleBadge: FC<{ role: string }> = ({ role }) => (
    <span className={`dash-role ${ROLE_CLASS[role.toLowerCase()] ?? "dash-role--customer"}`}>
        {role}
    </span>
);
