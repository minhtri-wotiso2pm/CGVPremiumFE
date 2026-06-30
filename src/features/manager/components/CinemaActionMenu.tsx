import { type FC, useState } from "react";
import { Popover } from "antd";
import type { Cinema, CinemaModalType } from "../types/cinema.types";

interface Props {
    cinema: Cinema;
    isProcessing: boolean;
    onAction: (type: CinemaModalType) => void;
}

const DotsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="5" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
);
const EyeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const DoorIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);

const CinemaActionMenu: FC<Props> = ({ cinema, isProcessing, onAction }) => {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    const handle = (type: CinemaModalType) => {
        close();
        onAction(type);
    };

    const menuStyle: React.CSSProperties = {
        display: "flex", flexDirection: "column", minWidth: 200,
    };
    const headerStyle: React.CSSProperties = {
        padding: "12px 16px 10px",
        borderBottom: "1px solid var(--dash-border)",
        marginBottom: 6,
    };
    const itemStyle = (danger = false, disabled = false): React.CSSProperties => ({
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 16px",
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        color: danger ? "#E8001C" : disabled ? "var(--dash-text-3)" : "var(--dash-text-1)",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.15s",
        borderRadius: 6,
        margin: "0 6px",
        border: "none", background: "transparent", width: "calc(100% - 12px)",
        textAlign: "left",
    });
    const dividerStyle: React.CSSProperties = {
        height: 1, background: "var(--dash-border)", margin: "4px 0",
    };

    const content = (
        <div style={menuStyle}>
            {/* Cinema preview */}
            <div style={headerStyle}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)", marginBottom: 3 }}>
                    {cinema.cinemaName}
                </div>
                <span className={`dash-badge ${cinema.status === "ACTIVE" ? "dash-badge--active" : "dash-badge--inactive"}`}
                    style={{ fontSize: 10 }}>
                    {cinema.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
            </div>

            <button style={itemStyle(false, true)} disabled>
                <EyeIcon />
                View Detail
            </button>
            <button style={itemStyle(false, true)} disabled>
                <DoorIcon />
                Manage Rooms
            </button>
            <div style={dividerStyle} />
            <button style={itemStyle()} onClick={() => handle("edit")} onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--dash-bg)";
            }} onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}>
                <EditIcon />
                Edit Cinema
            </button>
            <div style={dividerStyle} />
            <button style={{ ...itemStyle(true), paddingBottom: 12 }} onClick={() => handle("delete")}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,28,0.05)";
                }} onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}>
                <TrashIcon />
                Delete Cinema
            </button>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayInnerStyle={{ padding: "6px 0", borderRadius: 10, minWidth: 200 }}
            arrow={false}
        >
            <button
                className="dash-action-btn"
                aria-label="Cinema actions"
                disabled={isProcessing}
                style={{ opacity: isProcessing ? 0.5 : 1 }}
            >
                <DotsIcon />
            </button>
        </Popover>
    );
};

export default CinemaActionMenu;
