import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";
import { loginApi } from "@/services/api/auth.service";
import { getDashboardByRole } from "../utils/getDashboardByRole";

/* ─────────────────────────────────────────────────────────────
DESIGN TOKENS — CGVPremium Design System
───────────────────────────────────────────────────────────── */
const T = {
    // Colors
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
    // Spacing
    radius: "8px",
    radiusCard: "16px",
} as const;

/* ─────────────────────────────────────────────────────────────
VALIDATION
───────────────────────────────────────────────────────────── */
const rules = {
    email: (v: string): string => {
        if (!v.trim()) return "Email không được để trống.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Định dạng email không hợp lệ.";
        return "";
    },
    password: (v: string): string => {
        if (!v) return "Mật khẩu không được để trống.";
        if (v.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
        return "";
    },
};

function passwordStrength(v: string): 0 | 1 | 2 | 3 {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v) || /[^A-Za-z0-9]/.test(v)) score++;
    return score as 0 | 1 | 2 | 3;
}

const strengthMeta: Record<
    1 | 2 | 3,
    { label: string; color: string }
> = {
    1: { label: "Yếu", color: T.crimson },
    2: { label: "Trung bình", color: "#f59e0b" },
    3: { label: "Mạnh", color: "#22c55e" },
};

/* ─────────────────────────────────────────────────────────────
SUB-COMPONENTS
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
        ? `0 0 0 3px rgba(232,0,28,0.1)`
        : isValid
            ? `0 0 0 3px rgba(34,197,94,0.06)`
            : isFocused
                ? `0 0 0 3px rgba(232,0,28,0.07)`
                : "none";

    return (
        <div style={{ marginBottom: 22 }}>
            {/* Label row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <label
                    htmlFor={id}
                    style={{
                        fontSize: 10.5,
                        letterSpacing: "0.18em",
                        fontWeight: 600,
                        color: T.textLabel,
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </label>
                {rightLabel}
            </div>

            {/* Input wrapper */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: isFocused ? T.inputBgFoc : T.inputBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: T.radius,
                    padding: "0 14px",
                    transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
                    boxShadow,
                }}
            >
                {/* Leading icon */}
                {false && (
                    <span>...</span>
                )}

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
                    style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: T.textPrimary,
                        fontSize: 14,
                        fontFamily: "inherit",
                        padding: "14px 0",
                        letterSpacing: "0.02em",
                        caretColor: T.crimson,
                    }}
                />

                {/* Valid check */}
                {isValid && !error && (
                    <span style={{ fontSize: 13, color: "#22c55e", marginLeft: 6 }} aria-hidden="true">✓</span>
                )}

                {rightAddon}
            </div>

            {belowInput}

            {/* Error message */}
            <p
                role="alert"
                aria-live="polite"
                style={{
                    fontSize: 11,
                    color: "#ff4444",
                    marginTop: error ? 6 : 0,
                    letterSpacing: "0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: error ? "auto" : 0,
                    overflow: "hidden",
                    opacity: error ? 1 : 0,
                    transition: "opacity 0.2s",
                }}
            >
                {error && <><span aria-hidden="true">⚠</span> {error}</>}
            </p>
        </div>
    );
}

/* Strength Bar */
function StrengthBar({ score }: { score: 0 | 1 | 2 | 3 }) {
    if (score === 0) return null;
    const meta = strengthMeta[score];
    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, height: 3 }}>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            borderRadius: 2,
                            background: i <= score ? meta.color : "rgba(255,255,255,0.08)",
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>
            <p style={{ fontSize: 10.5, color: meta.color, marginTop: 5, letterSpacing: "0.04em" }}>
                Độ mạnh: {meta.label}
            </p>
        </div>
    );
}

/* Google icon */
function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.1 22.56 15.28 22.56 12.25z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
        </svg>
    );
}

/* Apple icon */
function AppleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────
MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    /* Form state */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showPw, setShowPw] = useState(false);

    /* Touch state (validate on blur) */
    const [emailTouched, setEmailTouched] = useState(false);
    const [pwTouched, setPwTouched] = useState(false);
    const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

    /* API state */
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    /* Derived errors (only show after touch) */
    const emailError = emailTouched ? rules.email(email) : "";
    const pwError = pwTouched ? rules.password(password) : "";
    const pwScore = passwordStrength(password) as 0 | 1 | 2 | 3;

    /* Derived validity */
    const emailValid = !rules.email(email) && email !== "";
    const pwValid = !rules.password(password) && password !== "";

    /* Submit handler */
    const handleLogin = useCallback(async () => {
        // Touch all fields to trigger validation display
        setEmailTouched(true);
        setPwTouched(true);
        setApiError("");

        if (rules.email(email) || rules.password(password)) return;

        setLoading(true);
        try {
            const response = await loginApi({ email, password, rememberMe });
            const user = { ...response.user, role: response.user.role.toUpperCase() };
            localStorage.setItem("accessToken", response.token);
            localStorage.setItem("user", JSON.stringify(user));
            dispatch(loginSuccess({ accessToken: response.token, user }));
            navigate(getDashboardByRole(user.role));
        } catch (err: unknown) {
            console.error(err);
            setApiError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [email, password, rememberMe, dispatch, navigate]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); },
        [handleLogin]
    );

    /* Seat animation ref */
    const seatCount = 17;

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
            .cgv-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
            }
            .cgv-submit:active:not(:disabled) { transform: scale(0.98); }
            .cgv-social:hover {
            background: rgba(255,255,255,0.06) !important;
            border-color: rgba(255,255,255,0.15) !important;
            color: #d0b0b0 !important;
            }
            .cgv-input::placeholder { color: #3d2a2a; font-size: 13px; }
            @keyframes cgv-spin { to { transform: rotate(360deg); } }
            .cgv-spinner {
            width: 14px; height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #fff; border-radius: 50%;
            animation: cgv-spin 0.7s linear infinite;
            display: inline-block; vertical-align: middle;
            }
            @media (max-width: 520px) {
            .cgv-card { padding: 36px 24px 32px !important; }
            }
            @media (prefers-reduced-motion: reduce) {
            .cgv-card { animation: none !important; }
            }
        `}</style>

            <div
                className="cgv-root"
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0c0101",
                    position: "relative",
                    overflow: "hidden",
                    padding: "40px 20px",
                }}
            >
                {/* Background glows */}
                <div style={{
                    position: "absolute", left: -80, top: "20%", width: 320, height: 400,
                    background: "radial-gradient(ellipse, rgba(160,8,8,0.22) 0%, transparent 70%)",
                    pointerEvents: "none"
                }} />
                <div style={{
                    position: "absolute", right: -80, top: "15%", width: 320, height: 400,
                    background: "radial-gradient(ellipse, rgba(140,6,6,0.18) 0%, transparent 70%)",
                    pointerEvents: "none"
                }} />
                <div style={{
                    position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)",
                    width: 500, height: 200,
                    background: "radial-gradient(ellipse, rgba(180,10,10,0.15) 0%, transparent 70%)",
                    pointerEvents: "none"
                }} />

                {/* Seat silhouettes */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    gap: 6, padding: "0 10px", opacity: 0.18, pointerEvents: "none",
                }}>
                    {Array.from({ length: seatCount }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 32, height: 60, flexShrink: 0, borderRadius: "6px 6px 0 0",
                                background: "linear-gradient(180deg,#7a1010 0%,#4a0808 100%)",
                                position: "relative",
                            }}
                        >
                            <div style={{
                                position: "absolute", top: 4, left: 0, right: 0, height: 14,
                                background: "#c42020", borderRadius: "5px 5px 0 0",
                            }} />
                        </div>
                    ))}
                </div>

                {/* ── CARD ── */}
                <div
                    className="cgv-card"
                    role="main"
                    aria-label="Đăng nhập CGVPremium"
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
                            fontSize: 28, fontWeight: 700, letterSpacing: "0.06em",
                            background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 50%,#990000 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundClip: "text", margin: 0,
                        }}>
                            CGVPREMIUM
                        </h1>
                        <span style={{
                            width: 6, height: 6, borderRadius: "50%", background: T.crimson,
                            marginLeft: 2, marginBottom: 18, flexShrink: 0
                        }} />
                    </div>
                    <p style={{
                        textAlign: "center", fontSize: 9.5, letterSpacing: "0.35em",
                        color: "#5a4040", fontWeight: 500, textTransform: "uppercase", marginBottom: 40,
                    }}>
                        Cinema of Excellence
                    </p>
                    <div style={{ width: 32, height: 1, background: "rgba(232,0,28,0.3)", margin: "0 auto 40px" }} />

                    {/* API Error */}
                    {apiError && (
                        <div
                            role="alert"
                            style={{
                                background: "rgba(232,0,28,0.1)",
                                border: "1px solid rgba(232,0,28,0.25)",
                                borderRadius: T.radius,
                                padding: "11px 14px",
                                marginBottom: 20,
                                fontSize: 12,
                                color: "#ff6b6b",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                letterSpacing: "0.02em",
                            }}
                        >
                            <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
                            {apiError}
                        </div>
                    )}

                    {/* Email */}
                    <FormField
                        id="cgv-email"
                        label="Email Address"
                        type="email"
                        value={email}
                        placeholder="name@luxury.com"
                        autoComplete="email"
                        error={emailError}
                        isValid={emailValid}
                        isFocused={focusedField === "email"}
                        onChange={(v) => { setEmail(v); setApiError(""); }}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => { setFocusedField(null); setEmailTouched(true); }}
                        onKeyDown={handleKeyDown}
                    />

                    {/* Password */}
                    <FormField
                        id="cgv-password"
                        label="Password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        error={pwError}
                        isValid={pwValid}
                        isFocused={focusedField === "password"}
                        onChange={(v) => { setPassword(v); setApiError(""); }}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => { setFocusedField(null); setPwTouched(true); }}
                        onKeyDown={handleKeyDown}
                        rightLabel={
                            <button
                                type="button"
                                style={{
                                    fontSize: 11, color: "#7a3535", background: "none", border: "none",
                                    cursor: "pointer", padding: 0, letterSpacing: "0.04em", transition: "color 0.2s",
                                }}
                                onClick={() => { navigate("/forgotPassword") }}
                            >
                                Forgot password?
                            </button>
                        }
                        rightAddon={
                            <button
                                type="button"
                                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                onClick={() => setShowPw((v) => !v)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: 4, color: "#5a3333", fontSize: 15, transition: "color 0.2s",
                                    lineHeight: 1,
                                }}
                            >
                                {showPw ? "👁" : "👁"}
                            </button>
                        }
                        belowInput={<StrengthBar score={pwScore} />}
                    />

                    {/* Remember me */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 24 }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ width: 15, height: 15, accentColor: T.crimson, cursor: "pointer" }}
                        />
                        <label
                            htmlFor="rememberMe"
                            style={{ fontSize: 12, color: T.textFaint, cursor: "pointer", letterSpacing: "0.02em" }}
                        >
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        className="cgv-submit"
                        type="button"
                        disabled={loading}
                        onClick={handleLogin}
                        aria-busy={loading}
                        style={{
                            width: "100%", padding: 15,
                            background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                            color: "#fff", border: "none", borderRadius: T.radius,
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
                            boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading && <span className="cgv-spinner" aria-hidden="true" />}
                        {loading ? "Đang đăng nhập…" : "Sign In"}
                    </button>



                    {/* Register */}
                    <p style={{ textAlign: "center", marginTop: 28, fontSize: 12.5, color: T.textFaint }}>
                        New to the CGVPremium? {" "}
                        <a
                            href="/register"
                            onClick={(e) => { e.preventDefault(); navigate("/register"); }}
                            style={{
                                color: T.crimson, fontWeight: 600, textDecoration: "none",
                                letterSpacing: "0.02em",
                                borderBottom: `1px solid transparent`,
                                transition: "border-color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = T.crimson)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
                        >
                            Register for VIP
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <p style={{
                    position: "relative", zIndex: 10, marginTop: 28,
                    fontSize: 9.5, color: "#5a4040", letterSpacing: "0.14em",
                    textAlign: "center", textTransform: "uppercase",
                }}>
                    © 2026 CGVPremium Entertainment Systems · All Rights Reserved
                </p>
            </div>
        </>
    );
}