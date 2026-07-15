import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { verifyEmail } from "@/services/api/auth.service";

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
    textLabel: "#6b4a4a",
    borderBase: "rgba(255,255,255,0.07)",
    borderFocus: "rgba(232,0,28,0.4)",
    borderError: "rgba(232,0,28,0.7)",
    borderValid: "rgba(34,197,94,0.35)",
    inputBg: "rgba(255,255,255,0.033)",
    inputBgFoc: "rgba(255,255,255,0.045)",
    radius: "8px",
    radiusCard: "16px",
} as const;

/* ─────────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────────── */
const validateCode = (v: string): string => {
    if (!v.trim()) return "Verification code is required.";
    return "";
};

/* ─────────────────────────────────────────────────────────────
   FORM FIELD — mirrors LoginPage exactly
───────────────────────────────────────────────────────────── */
interface FieldProps {
    id: string;
    label: string;
    type: string;
    value: string;
    placeholder: string;
    autoComplete: string;
    error: string;
    isValid: boolean;
    isFocused: boolean;
    onChange: (v: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    rightAddon?: React.ReactNode;
    belowInput?: React.ReactNode;
    rightLabel?: React.ReactNode;
}

function FormField({
    id, label, type, value, placeholder, autoComplete,
    error, isValid, isFocused,
    onChange, onFocus, onBlur, onKeyDown,
    rightAddon, belowInput, rightLabel,
}: FieldProps) {
    const borderColor = error
        ? T.borderError
        : isValid
            ? T.borderValid
            : isFocused
                ? T.borderFocus
                : T.borderBase;

    const boxShadow = error
        ? "0 0 0 3px rgba(232,0,28,0.1)"
        : isValid
            ? "0 0 0 3px rgba(34,197,94,0.06)"
            : isFocused
                ? "0 0 0 3px rgba(232,0,28,0.07)"
                : "none";

    return (
        <div style={{ marginBottom: 22 }}>
            {/* Label row */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 9,
            }}>
                <label
                    htmlFor={id}
                    style={{
                        fontSize: 10.5, letterSpacing: "0.18em",
                        fontWeight: 600, color: T.textLabel,
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </label>
                {rightLabel}
            </div>

            {/* Input wrapper */}
            <div style={{
                display: "flex", alignItems: "center",
                background: isFocused ? T.inputBgFoc : T.inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: T.radius,
                padding: "0 14px",
                transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
                boxShadow,
            }}>
                <input
                    id={id}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    className="cgv-input"
                    style={{
                        flex: 1, background: "transparent",
                        border: "none", outline: "none",
                        color: T.textPrimary, fontSize: 14,
                        fontFamily: "inherit", padding: "14px 0",
                        letterSpacing: "0.12em", caretColor: T.crimson,
                    }}
                />

                {/* Valid checkmark */}
                {isValid && !error && (
                    <span
                        aria-hidden="true"
                        style={{ fontSize: 13, color: "#22c55e", marginLeft: 6, flexShrink: 0 }}
                    >
                        ✓
                    </span>
                )}

                {rightAddon}
            </div>

            {belowInput}

            {/* Error message */}
            <p
                role="alert"
                aria-live="polite"
                style={{
                    fontSize: 11, color: "#ff4444",
                    marginTop: error ? 6 : 0,
                    letterSpacing: "0.02em",
                    display: "flex", alignItems: "center", gap: 5,
                    height: error ? "auto" : 0,
                    overflow: "hidden",
                    opacity: error ? 1 : 0,
                    transition: "opacity 0.2s",
                    lineHeight: 1.4,
                }}
            >
                {error && <><span aria-hidden="true">⚠</span>{error}</>}
            </p>
        </div>
    );
}

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
   SUCCESS STATE CARD BODY
───────────────────────────────────────────────────────────── */
function SuccessBody({ onGoToLogin }: { onGoToLogin: () => void }) {
    return (
        <>
            {/* Animated success icon */}
            <div
                role="status"
                aria-label="Email verified successfully"
                style={{
                    width: 72, height: 72, borderRadius: "50%",
                    border: "2px solid rgba(34,197,94,0.35)",
                    background: "rgba(34,197,94,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 28px",
                    boxShadow: "0 0 0 6px rgba(34,197,94,0.05)",
                    animation: "cgv-icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
                }}
            >
                <svg
                    width="32" height="32" viewBox="0 0 24 24"
                    fill="none" stroke="#22c55e"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>

            {/* Heading */}
            <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20, fontWeight: 700, letterSpacing: "0.04em",
                color: T.textPrimary, margin: "0 0 14px",
                textAlign: "center",
            }}>
                Email Verified Successfully
            </h2>

            {/* Body copy */}
            <p style={{
                fontSize: 13, color: T.textMuted, lineHeight: 1.8,
                letterSpacing: "0.02em", marginBottom: 8, textAlign: "center",
            }}>
                Your email has been verified.
            </p>
            <p style={{
                fontSize: 13, color: T.textFaint, lineHeight: 1.7,
                letterSpacing: "0.02em", marginBottom: 36, textAlign: "center",
            }}>
                You can now sign in to your account.
            </p>

            <div style={{
                width: 32, height: 1,
                background: "rgba(232,0,28,0.3)",
                margin: "0 auto 32px",
            }} />

            {/* CTA */}
            <button
                type="button"
                className="cgv-btn-primary"
                onClick={onGoToLogin}
                style={{
                    width: "100%", padding: 15,
                    background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                    color: "#fff", border: "none", borderRadius: T.radius,
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
                    textTransform: "uppercase", cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "transform 0.15s, box-shadow 0.2s",
                    boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                }}
            >
                Go To Login
            </button>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────
   VERIFY EMAIL PAGE
───────────────────────────────────────────────────────────── */
type PageState = "form" | "success";

export default function VerifyEmailPage() {
    const navigate = useNavigate();

    /* ── Form state ── */
    const [code, setCode] = useState("");
    const [codeTouched, setCodeTouched] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    /* ── Async state ── */
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [pageState, setPageState] = useState<PageState>("form");

    /* ── Derived ── */
    const codeError = codeTouched ? validateCode(code) : "";
    const codeValid = !validateCode(code) && code.trim() !== "";

    /* ── Submit ── */
    const handleVerify = useCallback(async () => {
        setCodeTouched(true);
        setApiError("");

        if (validateCode(code)) return;

        setLoading(true);
        try {
            const response = await verifyEmail({ code: code.trim() });

            if (response.success) {
                setPageState("success");
                navigate("/registerSuccess");
            } else {
                setApiError(
                    response.message ||
                    "Verification failed. Please check your code and try again."
                );
            }
        } catch {
            setApiError("Verification failed. Please check your code and try again.");
        } finally {
            setLoading(false);
        }
    }, [code]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => { if (e.key === "Enter") handleVerify(); },
        [handleVerify],
    );

    const isSuccess = pageState === "success";

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');

                .cgv-root { font-family: 'Inter','Helvetica Neue',Arial,sans-serif; }

                .cgv-card {
                    animation: cgv-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes cgv-card-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes cgv-icon-pop {
                    from { opacity: 0; transform: scale(0.6); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .cgv-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
                }
                .cgv-btn-primary:active { transform: scale(0.98); }

                .cgv-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
                }
                .cgv-submit:active:not(:disabled) { transform: scale(0.98); }

                .cgv-back-link:hover { color: #E8001C !important; }

                .cgv-input::placeholder { color: #3d2a2a; font-size: 13px; letter-spacing: 0.06em; }

                @keyframes cgv-spin { to { transform: rotate(360deg); } }
                .cgv-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; border-radius: 50%;
                    animation: cgv-spin 0.7s linear infinite;
                    display: inline-block; vertical-align: middle; flex-shrink: 0;
                }

                @media (max-width: 520px) { .cgv-card { padding: 36px 24px 32px !important; } }
                @media (prefers-reduced-motion: reduce) {
                    .cgv-card, .cgv-icon-pop { animation: none !important; }
                }
            `}</style>

            <div className="cgv-root" style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: T.bg, position: "relative",
                overflow: "hidden", padding: "40px 20px",
            }}>
                {/* ── Background glows ── */}
                <div style={{
                    position: "absolute", left: -80, top: "20%",
                    width: 320, height: 400, pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(160,8,8,0.22) 0%, transparent 70%)",
                }} />
                <div style={{
                    position: "absolute", right: -80, top: "15%",
                    width: 320, height: 400, pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(140,6,6,0.18) 0%, transparent 70%)",
                }} />
                <div style={{
                    position: "absolute", bottom: -60, left: "50%",
                    transform: "translateX(-50%)",
                    width: 500, height: 200, pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(180,10,10,0.15) 0%, transparent 70%)",
                }} />

                <SeatRow />

                {/* ── CARD ── */}
                <div
                    className="cgv-card"
                    role="main"
                    aria-label="Xác thực email CVPremium"
                    style={{
                        position: "relative", zIndex: 10,
                        background: T.surface,
                        border: `1px solid ${T.borderBase}`,
                        borderRadius: T.radiusCard,
                        padding: "52px 52px 44px",
                        width: "100%", maxWidth: 440,
                        boxShadow: `0 0 0 1px rgba(232,0,28,0.04),
                                    0 32px 64px rgba(0,0,0,0.8),
                                    0 8px 24px rgba(0,0,0,0.5)`,
                    }}
                >
                    {/* ── Brand (always visible) ── */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "center", marginBottom: 4,
                    }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 28, fontWeight: 700,
                            letterSpacing: "0.06em", margin: 0,
                            background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 50%,#990000 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            CVPREMIUM
                        </h1>
                        <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: T.crimson,
                            marginLeft: 2, marginBottom: 18, flexShrink: 0,
                        }} />
                    </div>

                    <p style={{
                        textAlign: "center", fontSize: 9.5,
                        letterSpacing: "0.35em", color: "#5a4040",
                        fontWeight: 500, textTransform: "uppercase",
                        marginBottom: isSuccess ? 32 : 10,
                    }}>
                        Cinema of Excellence
                    </p>

                    {/* ── SUCCESS STATE ── */}
                    {isSuccess ? (
                        <SuccessBody onGoToLogin={() => navigate("/login")} />
                    ) : (
                        /* ── FORM STATE ── */
                        <>
                            <p style={{
                                textAlign: "center", fontSize: 13,
                                color: T.textMuted, letterSpacing: "0.02em",
                                lineHeight: 1.75, marginBottom: 36, padding: "0 4px",
                            }}>
                                Enter the verification code sent to your email address.
                            </p>

                            <div style={{
                                width: 32, height: 1,
                                background: "rgba(232,0,28,0.3)",
                                margin: "0 auto 36px",
                            }} />

                            {/* ── API Error toast ── */}
                            {apiError && (
                                <div
                                    role="alert"
                                    style={{
                                        background: "rgba(232,0,28,0.1)",
                                        border: "1px solid rgba(232,0,28,0.25)",
                                        borderRadius: T.radius,
                                        padding: "11px 14px", marginBottom: 20,
                                        fontSize: 12, color: "#ff6b6b",
                                        display: "flex", alignItems: "flex-start",
                                        gap: 8, letterSpacing: "0.02em",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠</span>
                                    {apiError}
                                </div>
                            )}

                            {/* ── Code input ── */}
                            <FormField
                                id="cgv-verify-code"
                                label="Verification Code"
                                type="text"
                                value={code}
                                placeholder="Enter verification code"
                                autoComplete="one-time-code"
                                error={codeError}
                                isValid={codeValid}
                                isFocused={isFocused}
                                onChange={(v) => {
                                    setCode(v);
                                    setApiError("");
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    setIsFocused(false);
                                    setCodeTouched(true);
                                }}
                                onKeyDown={handleKeyDown}
                            />

                            {/* ── Submit ── */}
                            <button
                                type="button"
                                className="cgv-submit"
                                disabled={loading}
                                onClick={handleVerify}
                                aria-busy={loading}
                                style={{
                                    width: "100%", padding: 15, marginTop: 8,
                                    background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                                    color: "#fff", border: "none", borderRadius: T.radius,
                                    fontSize: 12, fontWeight: 700,
                                    letterSpacing: "0.22em", textTransform: "uppercase",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                    transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
                                    boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 8,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading && <span className="cgv-spinner" aria-hidden="true" />}
                                {loading ? "Verifying..." : "Verify Email"}
                            </button>

                            {/* Secondary button */}
                            <button
                                type="button"
                                className="cgv-btn-secondary"
                                onClick={() => navigate("/registerEmailSend")}
                                style={{
                                    width: "100%", padding: 14, marginTop: 12,
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
                            </button>

                            {/* ── Back to sign in ── */}
                            <p style={{
                                textAlign: "center", marginTop: 28,
                                fontSize: 12.5, color: T.textFaint,
                            }}>
                                <button
                                    type="button"
                                    className="cgv-back-link"
                                    onClick={() => navigate("/login")}
                                    style={{
                                        background: "none", border: "none", padding: 0,
                                        color: T.crimson, fontWeight: 600, cursor: "pointer",
                                        fontSize: 12.5, fontFamily: "inherit",
                                        letterSpacing: "0.02em", transition: "color 0.2s",
                                    }}
                                >
                                    Back to Sign In
                                </button>
                            </p>
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <p style={{
                    position: "relative", zIndex: 10, marginTop: 28,
                    fontSize: 9.5, color: "#5a4040", letterSpacing: "0.14em",
                    textAlign: "center", textTransform: "uppercase",
                }}>
                    © 2026 CVPremium Entertainment Systems · All Rights Reserved
                </p>
            </div>
        </>
    );
}