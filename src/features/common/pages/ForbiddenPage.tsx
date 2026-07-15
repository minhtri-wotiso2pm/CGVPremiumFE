/**
 * ForbiddenPage.tsx — CVPremium 403
 *
 * Route: <Route path="/403" element={<ForbiddenPage />} />
 * Also dispatch to this route from auth guards on role mismatch.
 *
 * Design: Amber-tinted variant of the error page system.
 * Shows a VIP lock SVG, "403" in amber glow, and two action buttons.
 */

import type { FC } from "react";
import { useNavigate } from "react-router-dom";

import ErrorHero from "@/features/common/components/ErrorHero";
import ErrorIllustration from "@/features/common/components/ErrorIllustration";
import ErrorActions, { type ActionButton } from "@/features/common/components/ErrorActions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import "@/features/common/error-pages.css";

/** Role → home route, so "Go Home" from a 403 lands each role on their own
 *  dashboard instead of the guest-only "/" (which staff/manager/admin
 *  can't meaningfully use). Falls back to the guest home for logged-out
 *  visitors or any unrecognized role. */
const ROLE_HOME_ROUTE: Record<string, string> = {
    [ROLES.CUSTOMER]: ROUTES.CUSTOMER.DASHBOARD,
    [ROLES.STAFF]: ROUTES.STAFF.DASHBOARD,
    [ROLES.MANAGER]: ROUTES.MANAGER.DASHBOARD,
    [ROLES.ADMIN]: ROUTES.ADMIN.DASHBOARD,
};

/* ── Seat silhouette row ── */
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

/* ── Arrow back icon ── */
const ArrowBackIcon: FC = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true"
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────────── */
const ForbiddenPage: FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const homeRoute = user ? (ROLE_HOME_ROUTE[user.role] ?? ROUTES.HOME) : ROUTES.HOME;

    const actions: ActionButton[] = [
        {
            label: "Go Home",
            variant: "primary-amber",
            icon: <HomeIcon />,
            onClick: () => navigate(homeRoute),
            ariaLabel: "Return to home page",
        },
        {
            label: "Go Back",
            variant: "secondary",
            icon: <ArrowBackIcon />,
            onClick: () => navigate(-1),
            ariaLabel: "Go to previous page",
        },
    ];

    return (
        <main
            className="ep-root ep-root--amber"
            aria-label="403 — Access denied"
            role="main"
        >
            {/* Background glows — amber variant overrides via .ep-root--amber */}
            <div className="ep-glow ep-glow--left" aria-hidden="true" />
            <div className="ep-glow ep-glow--right" aria-hidden="true" />
            <div className="ep-glow ep-glow--bottom" aria-hidden="true" />

            {/* Seat silhouettes */}
            <SeatRow />

            {/* Card */}
            <div className="ep-card" role="region" aria-labelledby="ep-403-title">
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
                        CVPREMIUM
                    </span>
                    <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#E8001C", marginBottom: 11, flexShrink: 0,
                    }} />
                </div>

                {/* Large error number — amber glow */}
                <ErrorHero code="403" />

                {/* Floating illustration */}
                <div className="ep-illustration" aria-hidden="true">
                    <ErrorIllustration variant="locked" size={108} />
                </div>

                {/* Divider */}
                <div className="ep-divider ep-divider--amber" aria-hidden="true" />

                {/* Text */}
                <h2 id="ep-403-title" className="ep-title">
                    Access Denied
                </h2>
                <p className="ep-subtitle">
                    You don't have permission to access this page.
                    If you believe this is an error, please contact your administrator.
                </p>

                {/* Error code pill */}
                <span className="ep-error-code">Error Code: 403</span>

                {/* Actions */}
                <ErrorActions actions={actions} />
            </div>

            {/* Footer */}
            <p className="ep-footer">
                © 2026 CVPremium Entertainment Systems · All Rights Reserved
            </p>
        </main>
    );
};

export default ForbiddenPage;