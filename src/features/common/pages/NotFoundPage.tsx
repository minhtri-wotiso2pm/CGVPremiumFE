/**
 * NotFoundPage.tsx — CGVPremium 404
 *
 * Route: <Route path="*" element={<NotFoundPage />} />
 *
 * Design: Luxury Dark Red cinema theme.
 * Shows a broken film reel SVG, large glowing "404" hero,
 * and two action buttons.
 */

import type { FC } from "react";
import { useNavigate } from "react-router-dom";

import ErrorHero from "@/features/common/components/ErrorHero";
import ErrorIllustration from "@/features/common/components/ErrorIllustration";
import ErrorActions, { type ActionButton } from "@/features/common/components/ErrorActions";
import "@/features/common/error-pages.css";

/* ── Seat silhouette row (reused from auth pages) ── */
const SeatRow: FC = () => (
    <div className="ep-seats" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="ep-seat" />
        ))}
    </div>
);

/* ── Home icon ── */
const HomeIcon: FC = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true"
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

/* ── Film icon ── */
const FilmIcon: FC = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true"
    >
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
);

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────────── */
const NotFoundPage: FC = () => {
    const navigate = useNavigate();

    const actions: ActionButton[] = [
        {
            label: "Back to Home",
            variant: "primary",
            icon: <HomeIcon />,
            onClick: () => navigate("/"),
            ariaLabel: "Return to home page",
        },
        {
            label: "Browse Movies",
            variant: "secondary",
            icon: <FilmIcon />,
            onClick: () => navigate("/customer/movies"),
            ariaLabel: "Browse all movies",
        },
    ];

    return (
        <main
            className="ep-root"
            aria-label="404 — Page not found"
            role="main"
        >
            {/* Background glows */}
            <div className="ep-glow ep-glow--left" aria-hidden="true" />
            <div className="ep-glow ep-glow--right" aria-hidden="true" />
            <div className="ep-glow ep-glow--bottom" aria-hidden="true" />

            {/* Seat silhouettes */}
            <SeatRow />

            {/* Card */}
            <div className="ep-card" role="region" aria-labelledby="ep-404-title">
                {/* Brand mark */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 5, marginBottom: 28,
                }}>
                    <span style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 15, fontWeight: 700, letterSpacing: "0.1em",
                        background: "linear-gradient(135deg, #ff1a1a, #cc0000)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        CGVPREMIUM
                    </span>
                    <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#E8001C", marginBottom: 11, flexShrink: 0,
                    }} />
                </div>

                {/* Large error number */}
                <ErrorHero code="404" />

                {/* Floating illustration */}
                <div className="ep-illustration" aria-hidden="true">
                    <ErrorIllustration variant="broken-film" size={108} />
                </div>

                {/* Divider */}
                <div className="ep-divider" aria-hidden="true" />

                {/* Text */}
                <h2 id="ep-404-title" className="ep-title">
                    Page Not Found
                </h2>
                <p className="ep-subtitle">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                    It might have been removed or the link is broken.
                </p>

                {/* Error code pill */}
                <span className="ep-error-code">Error Code: 404</span>

                {/* Actions */}
                <ErrorActions actions={actions} />
            </div>

            {/* Footer */}
            <p className="ep-footer">
                © 2026 CGVPremium Entertainment Systems · All Rights Reserved
            </p>
        </main>
    );
};

export default NotFoundPage;