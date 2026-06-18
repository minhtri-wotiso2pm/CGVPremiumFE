import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "@/services/api/auth.service";
import axios from "axios";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — CGVPremium Design System
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
   VALIDATION RULES
───────────────────────────────────────────────────────────── */
const rules = {
    fullName: (v: string): string => {
        if (!v.trim()) return "Họ và tên không được để trống.";
        if (v.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự.";
        return "";
    },
    email: (v: string): string => {
        if (!v.trim()) return "Email không được để trống.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Định dạng email không hợp lệ.";
        return "";
    },
    phone: (v: string): string => {
        if (!v.trim()) return "Số điện thoại không được để trống.";
        if (!/^\d+$/.test(v)) return "Số điện thoại chỉ được chứa chữ số.";
        if (v.length !== 10) return "Số điện thoại phải đúng 10 chữ số.";
        if (!v.startsWith("0")) return "Số điện thoại phải bắt đầu bằng số 0.";
        return "";
    },
    password: (v: string): string => {
        if (!v) return "Mật khẩu không được để trống.";
        if (v.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
        return "";
    },
    confirmPassword: (v: string, pw: string): string => {
        if (!v) return "Xác nhận mật khẩu không được để trống.";
        if (v !== pw) return "Mật khẩu xác nhận không khớp.";
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

const strengthMeta: Record<1 | 2 | 3, { label: string; color: string }> = {
    1: { label: "Yếu", color: T.crimson },
    2: { label: "Trung bình", color: "#f59e0b" },
    3: { label: "Mạnh", color: "#22c55e" },
};

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
                            flex: 1, borderRadius: 2,
                            background: i <= score ? meta.color : "rgba(255,255,255,0.08)",
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>
            <p style={{
                fontSize: 10.5, color: meta.color,
                marginTop: 5, letterSpacing: "0.04em",
            }}>
                Độ mạnh: {meta.label}
            </p>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   EYE ICON SVGs — consistent, no emoji variance issues
───────────────────────────────────────────────────────────── */
function EyeOpen() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOff() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type FocusedField =
    | "fullName" | "email" | "phone"
    | "password" | "confirmPassword"
    | null;

interface RegisterPayload {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
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
    maxLength?: number;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function FormField({
    id, label, type, value, placeholder, autoComplete,
    error, isValid, isFocused,
    onChange, onFocus, onBlur, onKeyDown,
    rightAddon, belowInput, rightLabel,
    maxLength, inputMode,
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
        <div style={{ marginBottom: 20 }}>
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
                    maxLength={maxLength}
                    inputMode={inputMode}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    className="cgv-input"
                    style={{
                        flex: 1, background: "transparent",
                        border: "none", outline: "none",
                        color: T.textPrimary, fontSize: 14,
                        fontFamily: "inherit", padding: "13px 0",
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
   SECTION DIVIDER
───────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 8 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{
                fontSize: 9.5, letterSpacing: "0.22em", color: "#4a3030",
                textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
                {children}
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   TOGGLE PASSWORD BUTTON — reusable, consistent style
───────────────────────────────────────────────────────────── */
interface TogglePwProps {
    show: boolean;
    onToggle: () => void;
    label?: string;
}

function TogglePwButton({ show, onToggle, label }: TogglePwProps) {
    return (
        <button
            type="button"
            className="cgv-toggle-pw"
            aria-label={label ?? (show ? "Ẩn mật khẩu" : "Hiện mật khẩu")}
            onClick={onToggle}
            style={{
                background: "none", border: "none",
                cursor: "pointer", padding: "4px 2px",
                color: "#5a3333", lineHeight: 1,
                flexShrink: 0,
                display: "flex", alignItems: "center",
                transition: "color 0.2s",
            }}
        >
            {show ? <EyeOff /> : <EyeOpen />}
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────
   REGISTER PAGE
───────────────────────────────────────────────────────────── */
export default function RegisterPage() {
    const navigate = useNavigate();

    /* ── Form values ── */
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    /* ── Visibility toggles ── */
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    /* ── Touch state ── */
    const [fullNameTouched, setFullNameTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
    const [focusedField, setFocusedField] = useState<FocusedField>(null);

    /* ── Submit state ── */
    const [loading, setLoading] = useState(false);
    const [submitErr, setSubmitErr] = useState("");

    /* ── Derived errors (post-touch only) ── */
    const fullNameError = fullNameTouched ? rules.fullName(fullName) : "";
    const emailError = emailTouched ? rules.email(email) : "";
    const phoneError = phoneTouched ? rules.phone(phone) : "";
    const passwordError = passwordTouched ? rules.password(password) : "";
    const confirmPasswordError = confirmPasswordTouched ? rules.confirmPassword(confirmPassword, password) : "";

    /* ── Derived validity ── */
    const fullNameValid = !rules.fullName(fullName) && fullName !== "";
    const emailValid = !rules.email(email) && email !== "";
    const phoneValid = !rules.phone(phone) && phone !== "";
    const passwordValid = !rules.password(password) && password !== "";
    const confirmPasswordValid = !rules.confirmPassword(confirmPassword, password) && confirmPassword !== "";

    const formIsValid =
        fullNameValid && emailValid && phoneValid &&
        passwordValid && confirmPasswordValid;

    /* ── Password strength ── */
    const pwScore = passwordStrength(password) as 0 | 1 | 2 | 3;

    /* ── Submit ── */
    const handleRegister = useCallback(async () => {
        setFullNameTouched(true);
        setEmailTouched(true);
        setPhoneTouched(true);
        setPasswordTouched(true);
        setConfirmPasswordTouched(true);
        setSubmitErr("");

        const hasErrors = [
            rules.fullName(fullName),
            rules.email(email),
            rules.phone(phone),
            rules.password(password),
            rules.confirmPassword(confirmPassword, password),
        ].some(Boolean);

        if (hasErrors) return;

        const payload: RegisterPayload = { fullName, email, phone, password, confirmPassword };

        setLoading(true);
        try {
            const response = await registerApi(payload);
            console.log("REGISTER SUCCESS:", response);
            navigate("/registerEmailSent");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setSubmitErr(error.response?.data?.message ?? "Đăng ký thất bại.");
            } else {
                setSubmitErr("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }, [fullName, email, phone, password, confirmPassword, navigate]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => { if (e.key === "Enter") handleRegister(); },
        [handleRegister],
    );

    const handlePhoneChange = (v: string) => {
        if (/^\d*$/.test(v) && v.length <= 10) {
            setPhone(v);
            setSubmitErr("");
        }
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
                .cgv-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(232,0,28,0.42) !important;
                }
                .cgv-submit:active:not(:disabled) { transform: scale(0.98); }
                .cgv-toggle-pw:hover { color: #E8001C !important; }
                .cgv-sign-in-link:hover { border-bottom-color: #E8001C !important; }
                .cgv-input::placeholder { color: #3d2a2a; font-size: 13px; }
                @keyframes cgv-spin { to { transform: rotate(360deg); } }
                .cgv-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; border-radius: 50%;
                    animation: cgv-spin 0.7s linear infinite;
                    display: inline-block; vertical-align: middle; flex-shrink: 0;
                }
                @media (max-width: 600px) { .cgv-card { padding: 36px 24px 32px !important; } }
                @media (prefers-reduced-motion: reduce) { .cgv-card { animation: none !important; } }
            `}</style>

            <div
                className="cgv-root"
                style={{
                    minHeight: "100vh", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: T.bg, position: "relative",
                    overflow: "hidden", padding: "48px 20px",
                }}
            >
                {/* Background glows */}
                <div style={{ position: "absolute", left: -80, top: "15%", width: 360, height: 420, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(160,8,8,0.22) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", right: -80, top: "10%", width: 360, height: 420, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(140,6,6,0.18) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 500, height: 220, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(180,10,10,0.15) 0%, transparent 70%)" }} />

                {/* Seat silhouettes */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, padding: "0 10px", opacity: 0.18, pointerEvents: "none" }}>
                    {Array.from({ length: 17 }).map((_, i) => (
                        <div key={i} style={{ width: 32, height: 60, flexShrink: 0, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg,#7a1010 0%,#4a0808 100%)", position: "relative" }}>
                            <div style={{ position: "absolute", top: 4, left: 0, right: 0, height: 14, background: "#c42020", borderRadius: "5px 5px 0 0" }} />
                        </div>
                    ))}
                </div>

                {/* ── CARD ── */}
                <div
                    className="cgv-card"
                    role="main"
                    aria-label="Đăng ký CGVPremium"
                    style={{
                        position: "relative", zIndex: 10,
                        background: T.surface,
                        border: `1px solid ${T.borderBase}`,
                        borderRadius: T.radiusCard,
                        padding: "48px 52px 44px",
                        width: "100%", maxWidth: 540,
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
                            CGVPREMIUM
                        </h1>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.crimson, marginLeft: 2, marginBottom: 18, flexShrink: 0 }} />
                    </div>

                    <p style={{ textAlign: "center", fontSize: 9.5, letterSpacing: "0.35em", color: "#5a4040", fontWeight: 500, textTransform: "uppercase", marginBottom: 6 }}>
                        Cinema of Excellence
                    </p>
                    <p style={{ textAlign: "center", fontSize: 11.5, color: T.textMuted, letterSpacing: "0.04em", marginBottom: 36 }}>
                        Create your VIP membership
                    </p>
                    <div style={{ width: 32, height: 1, background: "rgba(232,0,28,0.3)", margin: "0 auto 36px" }} />

                    {/* Submit error */}
                    {submitErr && (
                        <div role="alert" style={{
                            background: "rgba(232,0,28,0.1)", border: "1px solid rgba(232,0,28,0.25)",
                            borderRadius: T.radius, padding: "11px 14px", marginBottom: 20,
                            fontSize: 12, color: "#ff6b6b", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.02em",
                        }}>
                            <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
                            {submitErr}
                        </div>
                    )}

                    {/* ── Section 1: Personal info ── */}
                    <SectionLabel>Personal Information</SectionLabel>

                    <FormField
                        id="cgv-fullName" label="Full Name" type="text"
                        value={fullName} placeholder="Nguyễn Văn A" autoComplete="name"
                        error={fullNameError} isValid={fullNameValid} isFocused={focusedField === "fullName"}
                        onChange={(v) => { setFullName(v); setSubmitErr(""); }}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => { setFocusedField(null); setFullNameTouched(true); }}
                        onKeyDown={handleKeyDown}
                    />

                    <FormField
                        id="cgv-email" label="Email Address" type="email"
                        value={email} placeholder="name@luxury.com" autoComplete="email"
                        error={emailError} isValid={emailValid} isFocused={focusedField === "email"}
                        onChange={(v) => { setEmail(v); setSubmitErr(""); }}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => { setFocusedField(null); setEmailTouched(true); }}
                        onKeyDown={handleKeyDown}
                    />

                    <FormField
                        id="cgv-phone" label="Phone Number" type="tel"
                        value={phone} placeholder="0912 345 678" autoComplete="tel"
                        maxLength={10} inputMode="numeric"
                        error={phoneError} isValid={phoneValid} isFocused={focusedField === "phone"}
                        onChange={(v) => { handlePhoneChange(v); setSubmitErr(""); }}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => { setFocusedField(null); setPhoneTouched(true); }}
                        onKeyDown={handleKeyDown}
                    />

                    {/* ── Section 2: Security ── */}
                    <SectionLabel>Account Security</SectionLabel>

                    {/* Password + StrengthBar */}
                    <FormField
                        id="cgv-password" label="Password"
                        type={showPw ? "text" : "password"}
                        value={password} placeholder="Minimum 6 characters" autoComplete="new-password"
                        error={passwordError} isValid={passwordValid} isFocused={focusedField === "password"}
                        onChange={(v) => { setPassword(v); setSubmitErr(""); }}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => { setFocusedField(null); setPasswordTouched(true); }}
                        onKeyDown={handleKeyDown}
                        rightAddon={
                            <TogglePwButton
                                show={showPw}
                                onToggle={() => setShowPw((v) => !v)}
                            />
                        }
                        belowInput={<StrengthBar score={pwScore} />}
                    />

                    {/* Confirm Password — no strength bar, match indicator only */}
                    <FormField
                        id="cgv-confirmPassword" label="Confirm Password"
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword} placeholder="Re-enter your password" autoComplete="new-password"
                        error={confirmPasswordError} isValid={confirmPasswordValid} isFocused={focusedField === "confirmPassword"}
                        onChange={(v) => { setConfirmPassword(v); setSubmitErr(""); }}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => { setFocusedField(null); setConfirmPasswordTouched(true); }}
                        onKeyDown={handleKeyDown}
                        rightAddon={
                            <TogglePwButton
                                show={showConfirmPw}
                                onToggle={() => setShowConfirmPw((v) => !v)}
                            />
                        }
                    />

                    {/* Submit */}
                    <button
                        className="cgv-submit"
                        type="button"
                        disabled={loading || !formIsValid}
                        onClick={handleRegister}
                        aria-busy={loading}
                        style={{
                            width: "100%", padding: 15, marginTop: 8,
                            background: `linear-gradient(135deg,${T.crimson} 0%,${T.crimsonDim} 100%)`,
                            color: "#fff", border: "none", borderRadius: T.radius,
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                            fontFamily: "inherit",
                            transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
                            boxShadow: `0 4px 20px ${T.crimsonGlow}`,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            opacity: loading || !formIsValid ? 0.6 : 1,
                            cursor: loading || !formIsValid ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading && <span className="cgv-spinner" aria-hidden="true" />}
                        {loading ? "Đang đăng ký…" : "Register"}
                    </button>

                    {/* Sign in link */}
                    <p style={{ textAlign: "center", marginTop: 28, fontSize: 12.5, color: T.textFaint }}>
                        Already have an account?{" "}
                        <a
                            href="/login"
                            onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                            className="cgv-sign-in-link"
                            style={{
                                color: T.crimson, fontWeight: 600, textDecoration: "none",
                                letterSpacing: "0.02em", borderBottom: "1px solid transparent",
                                transition: "border-color 0.2s",
                            }}
                        >
                            Sign In
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