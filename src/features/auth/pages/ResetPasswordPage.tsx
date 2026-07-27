import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { resetPassword } from "@/services/api/auth.service";
import { EyeIcon, EyeOffIcon } from "@/components/ui/BrandIcons";

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
const rules = {
    newPassword: (v: string): string => {
        if (!v) return "validation.newPasswordRequired";
        if (v.length < 6) return "validation.passwordMin";
        return "";
    },
    confirmPassword: (v: string, pw: string): string => {
        if (!v) return "validation.confirmPasswordRequired";
        if (v !== pw) return "validation.passwordsMismatch";
        return "";
    },
};

/* ─────────────────────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────────────────────── */
function passwordStrength(v: string): 0 | 1 | 2 | 3 {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v) || /[^A-Za-z0-9]/.test(v)) score++;
    return score as 0 | 1 | 2 | 3;
}

const strengthMeta: Record<1 | 2 | 3, { color: string }> = {
    1: { color: T.crimson },
    2: { color: "#f59e0b" },
    3: { color: "#22c55e" },
};

function StrengthBar({ score }: { score: 0 | 1 | 2 | 3 }) {
    const { t } = useTranslation("auth");
    if (score === 0) return null;
    const meta = strengthMeta[score as 1 | 2 | 3];
    const label = score === 1 ? t("reset.strengthWeak") : score === 2 ? t("reset.strengthMedium") : t("reset.strengthStrong");
    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, height: 3 }}>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1, borderRadius: 2,
                            background: i <= score ? meta.color : "rgba(255,255,255,0.08)",
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>
            <p style={{ fontSize: 10.5, color: meta.color, marginTop: 5, letterSpacing: "0.04em" }}>
                {t("reset.strengthLabel")} {label}
            </p>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   FORM FIELD
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

            <div style={{
                display: "flex", alignItems: "center",
                background: isFocused ? T.inputBgFoc : T.inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: T.radius, padding: "0 14px",
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
                        letterSpacing: "0.02em", caretColor: T.crimson,
                    }}
                />

                {isValid && !error && (
                    <span aria-hidden="true" style={{ fontSize: 13, color: "#22c55e", marginLeft: 6, flexShrink: 0 }}>✓</span>
                )}

                {rightAddon}
            </div>

            {belowInput}

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
                    transition: "opacity 0.2s", lineHeight: 1.4,
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
   INVALID TOKEN CARD
───────────────────────────────────────────────────────────── */
function InvalidTokenCard({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation("auth");
    return (
        <div
            role="main"
            aria-label={t("reset.ariaInvalid")}
            style={{
                position: "relative", zIndex: 10,
                background: T.surface,
                border: `1px solid ${T.borderBase}`,
                borderRadius: T.radiusCard,
                padding: "52px 52px 44px",
                width: "100%", maxWidth: 440,
                boxShadow: `0 0 0 1px rgba(232,0,28,0.04), 0 32px 64px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)`,
                textAlign: "center",
                animation: "cgv-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both",
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

            {/* Warning icon */}
            <div style={{
                width: 72, height: 72, borderRadius: "50%",
                border: "2px solid rgba(232,0,28,0.35)",
                background: "rgba(232,0,28,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px",
                boxShadow: "0 0 0 6px rgba(232,0,28,0.05)",
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>

            <h2 style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 20, fontWeight: 700, letterSpacing: "0.04em",
                color: T.textPrimary, margin: "0 0 12px",
            }}>
                {t("reset.invalidTitle")}
            </h2>

            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.75, letterSpacing: "0.02em", marginBottom: 36 }}>
                {t("reset.invalidBody")}
            </p>

            <div style={{ width: 32, height: 1, background: "rgba(232,0,28,0.3)", margin: "0 auto 32px" }} />

            <button
                type="button"
                onClick={onBack}
                className="cgv-btn-primary"
                style={{
                    width: "100%", padding: 14,
                    background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                    color: "#fff", border: "none", borderRadius: T.radius,
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
                    textTransform: "uppercase", cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "transform 0.15s, box-shadow 0.2s",
                    boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                }}
            >
                {t("reset.backToLogin")}
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   RESET PASSWORD PAGE
───────────────────────────────────────────────────────────── */
export default function ResetPasswordPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    /* Form state */
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    /* Touch state */
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
    const [focusedField, setFocusedField] = useState<"password" | "confirmPassword" | null>(null);

    /* Toggle visibility */
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /* Derived errors */
    const passwordError = passwordTouched ? rules.newPassword(newPassword) : "";
    const confirmPasswordError = confirmPasswordTouched ? rules.confirmPassword(confirmPassword, newPassword) : "";

    /* Derived validity */
    const passwordValid = !rules.newPassword(newPassword) && newPassword !== "";
    const confirmPasswordValid = !rules.confirmPassword(confirmPassword, newPassword) && confirmPassword !== "";

    /* Password strength */
    const pwScore = passwordStrength(newPassword) as 0 | 1 | 2 | 3;

    /* Submit */
    const handleResetPassword = useCallback(async () => {
        setPasswordTouched(true);
        setConfirmPasswordTouched(true);
        setApiError("");

        const hasErrors =
            rules.newPassword(newPassword) ||
            rules.confirmPassword(confirmPassword, newPassword);

        if (hasErrors) return;
        if (!token) return;

        setLoading(true);
        try {
            await resetPassword({ token, newPassword, confirmPassword });
            navigate("/resetPasswordSuccess");
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message;
            setApiError(msg ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token, newPassword, confirmPassword, navigate]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => { if (e.key === "Enter") handleResetPassword(); },
        [handleResetPassword],
    );

    /* ── Toggle button shared style ── */
    const toggleBtnStyle: React.CSSProperties = {
        background: "none", border: "none", cursor: "pointer",
        padding: 4, color: "#5a3333", fontSize: 15,
        transition: "color 0.2s", lineHeight: 1, flexShrink: 0,
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
                .cgv-root { font-family: 'Inter','Helvetica Neue',Arial,sans-serif; }
                .cgv-card { animation: cgv-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both; }
                @keyframes cgv-card-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cgv-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
                }
                .cgv-btn-primary:active:not(:disabled) { transform: scale(0.98); }
                .cgv-toggle-pw:hover { color: #E8001C !important; }
                .cgv-back-link:hover { color: #E8001C !important; }
                .cgv-input::placeholder { color: #3d2a2a; font-size: 13px; }
                @keyframes cgv-spin { to { transform: rotate(360deg); } }
                .cgv-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; border-radius: 50%;
                    animation: cgv-spin 0.7s linear infinite;
                    display: inline-block; vertical-align: middle; flex-shrink: 0;
                }
                @media (max-width: 520px) { .cgv-card { padding: 36px 24px 32px !important; } }
                @media (prefers-reduced-motion: reduce) { .cgv-card { animation: none !important; } }
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

                {/* ── Invalid token fallback ── */}
                {!token ? (
                    <InvalidTokenCard onBack={() => navigate("/login")} />
                ) : (
                    /* ── Main card ── */
                    <div
                        className="cgv-card"
                        role="main"
                        aria-label="Reset your CVPremium password"
                        style={{
                            position: "relative", zIndex: 10,
                            background: T.surface,
                            border: `1px solid ${T.borderBase}`,
                            borderRadius: T.radiusCard,
                            padding: "52px 52px 44px",
                            width: "100%", maxWidth: 440,
                            boxShadow: `0 0 0 1px rgba(232,0,28,0.04), 0 32px 64px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)`,
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

                        <p style={{ textAlign: "center", fontSize: 9.5, letterSpacing: "0.35em", color: "#5a4040", fontWeight: 500, textTransform: "uppercase", marginBottom: 10 }}>
                                                    {t("reset.createNewPassword")}
                        </p>

                        <p style={{ textAlign: "center", fontSize: 13, color: T.textMuted, letterSpacing: "0.02em", lineHeight: 1.7, marginBottom: 36, padding: "0 4px" }}>
                                                    {t("reset.intro")}
                        </p>

                        <div style={{ width: 32, height: 1, background: "rgba(232,0,28,0.3)", margin: "0 auto 36px" }} />

                        {/* API Error */}
                        {apiError && (
                            <div role="alert" style={{
                                background: "rgba(232,0,28,0.1)",
                                border: "1px solid rgba(232,0,28,0.25)",
                                borderRadius: T.radius, padding: "11px 14px",
                                marginBottom: 20, fontSize: 12, color: "#ff6b6b",
                                display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.02em",
                            }}>
                                <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
                                {apiError}
                            </div>
                        )}

                        {/* New Password */}
                        <FormField
                            id="cgv-new-password"
                                                    label={t("reset.newPasswordLabel")}
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                                                    placeholder={t("reset.newPasswordPlaceholder")}
                            autoComplete="new-password"
                            error={passwordError}
                            isValid={passwordValid}
                            isFocused={focusedField === "password"}
                            onChange={(v) => { setNewPassword(v); setApiError(""); }}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => { setFocusedField(null); setPasswordTouched(true); }}
                            onKeyDown={handleKeyDown}
                            rightAddon={
                                <button
                                    type="button"
                                    className="cgv-toggle-pw"
                                                            aria-label={showPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                                    onClick={() => setShowPassword((v) => !v)}
                                    style={toggleBtnStyle}
                                >
                                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            }
                            belowInput={<StrengthBar score={pwScore} />}
                        />

                        {/* Confirm Password */}
                        <FormField
                            id="cgv-confirm-password"
                                                    label={t("reset.confirmPasswordLabel")}
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                                                    placeholder={t("reset.confirmPasswordPlaceholder")}
                            autoComplete="new-password"
                            error={confirmPasswordError}
                            isValid={confirmPasswordValid}
                            isFocused={focusedField === "confirmPassword"}
                            onChange={(v) => { setConfirmPassword(v); setApiError(""); }}
                            onFocus={() => setFocusedField("confirmPassword")}
                            onBlur={() => { setFocusedField(null); setConfirmPasswordTouched(true); }}
                            onKeyDown={handleKeyDown}
                            rightAddon={
                                <button
                                    type="button"
                                    className="cgv-toggle-pw"
                                                            aria-label={showConfirmPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    style={toggleBtnStyle}
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            }
                        />

                        {/* Submit */}
                        <button
                            type="button"
                            className="cgv-btn-primary"
                            disabled={loading}
                            onClick={handleResetPassword}
                            aria-busy={loading}
                            style={{
                                width: "100%", padding: 15, marginTop: 8,
                                background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                                color: "#fff", border: "none", borderRadius: T.radius,
                                fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                                transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
                                boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading && <span className="cgv-spinner" aria-hidden="true" />}
                            {loading ? t("reset.resetting") : t("reset.resetPassword")}
                        </button>

                        {/* Back to login */}
                        <p style={{ textAlign: "center", marginTop: 28, fontSize: 12.5, color: T.textFaint }}>
                                                    {t("reset.rememberPrompt")} {" "}
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
                                                        {t("login.signIn")}
                            </button>
                        </p>
                    </div>
                )}

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