import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — CVPremium Design System
───────────────────────────────────────────────────────────── */
const T = {
    crimson: "#E8001C",
    crimsonDim: "#b50016",
    crimsonGlow: "rgba(232,0,28,0.3)",
    bg: "#0c0101",
    surface: "rgba(14,5,5,0.95)",
    textPrimary: "#e8e0e0",
    textMuted: "#9a7a7a",
    textFaint: "#5a4040",
    borderBase: "rgba(255,255,255,0.07)",
    radius: "8px",
    radiusCard: "16px",
} as const;

/* ─────────────────────────────────────────────────────────────
   SEAT SILHOUETTES
───────────────────────────────────────────────────────────── */
function SeatRow() {
    return (
        <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 90, display: "flex", alignItems: "flex-end",
            justifyContent: "center", gap: 6, padding: "0 10px",
            opacity: 0.18, pointerEvents: "none",
        }}>
            {Array.from({ length: 17 }).map((_, i) => (
                <div key={i} style={{
                    width: 32, height: 60, flexShrink: 0,
                    borderRadius: "6px 6px 0 0",
                    background: "linear-gradient(180deg,#7a1010 0%,#4a0808 100%)",
                    position: "relative",
                }}>
                    <div style={{
                        position: "absolute", top: 4, left: 0, right: 0,
                        height: 14, background: "#c42020",
                        borderRadius: "5px 5px 0 0",
                    }} />
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   SUCCESS PAGE
───────────────────────────────────────────────────────────── */
export default function ForgotPasswordSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const { t } = useTranslation(["auth", "footer"]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
                .cgv-root { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
                .cgv-card { animation: cgv-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both; }
                @keyframes cgv-card-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cgv-icon-ring {
                    animation: cgv-icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both;
                }
                @keyframes cgv-icon-pop {
                    from { opacity: 0; transform: scale(0.6); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .cgv-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
                }
                .cgv-btn-primary:active { transform: scale(0.98); }
                .cgv-btn-secondary:hover {
                    background: rgba(255,255,255,0.06) !important;
                    border-color: rgba(255,255,255,0.18) !important;
                    color: #d0b0b0 !important;
                }
                .cgv-btn-secondary:active { transform: scale(0.98); }
                @media (max-width: 520px) { .cgv-card { padding: 36px 24px 32px !important; } }
                @media (prefers-reduced-motion: reduce) {
                    .cgv-card, .cgv-icon-ring { animation: none !important; }
                }
            `}</style>

            <div className="cgv-root" style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: T.bg, position: "relative",
                overflow: "hidden", padding: "40px 20px",
            }}>
                {/* Background glows */}
                <div style={{ position: "absolute", left: -80, top: "20%", width: 320, height: 400, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(160,8,8,0.22) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", right: -80, top: "15%", width: 320, height: 400, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(140,6,6,0.18) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 500, height: 200, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(180,10,10,0.15) 0%, transparent 70%)" }} />

                <SeatRow />

                {/* Card */}
                <div
                    className="cgv-card"
                    role="main"
                    aria-label={t("success.resetPassword.aria")}
                    style={{
                        position: "relative", zIndex: 10,
                        background: T.surface,
                        border: `1px solid ${T.borderBase}`,
                        borderRadius: T.radiusCard,
                        padding: "52px 52px 44px",
                        width: "100%", maxWidth: 440,
                        boxShadow: `0 0 0 1px rgba(232,0,28,0.04), 0 32px 64px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)`,
                        textAlign: "center",
                    }}
                >
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 28, fontWeight: 700, letterSpacing: "0.06em", margin: 0,
                            background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 50%,#990000 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                            CVPREMIUM
                        </h1>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.crimson, marginLeft: 2, marginBottom: 18, flexShrink: 0 }} />
                    </div>

                    <p style={{ fontSize: 9.5, letterSpacing: "0.35em", color: "#5a4040", fontWeight: 500, textTransform: "uppercase", marginBottom: 40 }}>
                        {t("brandTagline")}
                    </p>

                    {/* Success icon */}
                    <div className="cgv-icon-ring" style={{
                        width: 72, height: 72, borderRadius: "50%",
                        border: "2px solid rgba(34,197,94,0.35)",
                        background: "rgba(34,197,94,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 28px",
                        boxShadow: "0 0 0 6px rgba(34,197,94,0.05)",
                    }}>
                        <svg
                            width="32" height="32" viewBox="0 0 24 24"
                            fill="none" stroke="#22c55e"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h2 style={{
                        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: 20, fontWeight: 700, letterSpacing: "0.04em",
                        color: T.textPrimary, margin: "0 0 12px",
                    }}>
                        {t("success.resetPassword.title")}
                    </h2>

                    {/* Description */}
                    <p style={{
                        fontSize: 13, color: T.textMuted,
                        lineHeight: 1.75, letterSpacing: "0.02em",
                        margin: "0 0 8px",
                    }}>
                        {t("success.resetPassword.description")}
                    </p>

                    {/* Email display */}
                    {email && (
                        <div
                            role="status"
                            aria-label={t("success.resetPassword.emailStatus", { email })}
                            style={{
                                display: "inline-block",
                                background: "rgba(232,0,28,0.08)",
                                border: "1px solid rgba(232,0,28,0.2)",
                                borderRadius: T.radius,
                                padding: "8px 18px",
                                fontSize: 13, fontWeight: 600,
                                color: "#e8a0a0", letterSpacing: "0.03em",
                                marginBottom: 16,
                                wordBreak: "break-all",
                            }}
                        >
                            {email}
                        </div>
                    )}

                    <p style={{
                        fontSize: 12, color: T.textFaint,
                        lineHeight: 1.7, letterSpacing: "0.02em",
                        marginBottom: 36,
                    }}>
                        {t("success.resetPassword.helper")}
                    </p>

                    <div style={{ width: 32, height: 1, background: "rgba(232,0,28,0.3)", margin: "0 auto 32px" }} />

                    {/* Primary button */}
                    <button
                        type="button"
                        className="cgv-btn-primary"
                        onClick={() => navigate("/login")}
                        style={{
                            width: "100%", padding: 14,
                            background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                            color: "#fff", border: "none", borderRadius: T.radius,
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
                            textTransform: "uppercase", cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "transform 0.15s, box-shadow 0.2s",
                            boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                            marginBottom: 12,
                        }}
                    >
                        {t("success.resetPassword.button")}
                    </button>

                    {/* Secondary button
                    <button
                        type="button"
                        className="cgv-btn-secondary"
                        onClick={() => navigate("/forgotPassword")}
                        style={{
                            width: "100%", padding: 14,
                            background: "rgba(255,255,255,0.03)",
                            color: T.textMuted,
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: T.radius,
                            fontSize: 12, fontWeight: 600, letterSpacing: "0.18em",
                            textTransform: "uppercase", cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s",
                        }}
                    >
                        Resend Email
                    </button> */}
                </div>

                {/* Footer */}
                <p style={{
                    position: "relative", zIndex: 10, marginTop: 28,
                    fontSize: 9.5, color: "#5a4040", letterSpacing: "0.14em",
                    textAlign: "center", textTransform: "uppercase",
                }}>
                    {t("copyright", { ns: "footer" })}
                </p>
            </div>
        </>
    );
}