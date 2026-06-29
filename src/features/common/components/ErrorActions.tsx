/**
 * ErrorActions.tsx
 * Reusable action button group for error pages.
 */

import type { FC, ReactNode } from "react";
import "@/features/common/error-pages.css";

export interface ActionButton {
    label: string;
    variant: "primary" | "primary-amber" | "secondary";
    icon?: ReactNode;
    onClick: () => void;
    ariaLabel?: string;
}

interface Props {
    actions: ActionButton[];
}

const ErrorActions: FC<Props> = ({ actions }) => (
    <div className="ep-actions">
        {actions.map((action) => (
            <button
                key={action.label}
                className={`ep-btn ep-btn--${action.variant}`}
                onClick={action.onClick}
                aria-label={action.ariaLabel ?? action.label}
                type="button"
            >
                {action.icon}
                {action.label}
            </button>
        ))}
    </div>
);

export default ErrorActions;