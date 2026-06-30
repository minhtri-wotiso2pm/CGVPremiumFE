import type { FC, ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    icon?: ReactNode;
}

const DefaultIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);

const PlaceholderPage: FC<Props> = ({
    title,
    description = "This module is under development and will be available soon.",
    icon,
}) => (
    <div className="dash-fade-in">
        <div className="dash-page-header">
            <h1 className="dash-page-title">{title}</h1>
        </div>
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 16, padding: "72px 24px", textAlign: "center",
        }}>
            <div style={{ color: "var(--dash-text-3)", opacity: 0.4 }}>
                {icon ?? <DefaultIcon />}
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>
                Coming Soon
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--dash-text-2)", maxWidth: 340 }}>
                {description}
            </p>
            <div style={{
                marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 20,
                background: "rgba(232,0,28,0.05)", border: "1px solid rgba(232,0,28,0.12)",
                fontSize: 11, fontWeight: 600, color: "var(--dash-crimson)",
                letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--dash-crimson)" }} />
                In Development
            </div>
        </div>
    </div>
);

export default PlaceholderPage;
