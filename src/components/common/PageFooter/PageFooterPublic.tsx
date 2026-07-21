import { useState, type FC, type FormEvent, type JSX } from "react";
import { Link } from "react-router-dom";
/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const F = {
    bg: "#060101",
    surface: "rgba(14,4,4,0.9)",
    topBorder: "rgba(232,0,28,0.15)",
    crimson: "#E8001C",
    crimsonDim: "#b50016",
    crimsonSubtle: "rgba(232,0,28,0.08)",
    textPrimary: "#e8e0e0",
    textSecondary: "#9a7a7a",
    textMuted: "#5a4040",
    border: "rgba(255,255,255,0.05)",
    inputBg: "rgba(255,255,255,0.04)",
    radius: "8px",
} as const;

/* ─────────────────────────────────────────────────────────────
   FOOTER DATA (replace / extend via CMS later)
───────────────────────────────────────────────────────────── */
interface FooterLink { label: string; href: string }

const QUICK_LINKS: FooterLink[] = [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
];

const CINEMA_SERVICES: FooterLink[] = [
    { label: "Movie Booking", href: "/customer/movies" },
    { label: "VIP Membership", href: "/customer/membership" },
    { label: "Promotions", href: "/customer/promotions" },
    { label: "Gift Cards", href: "/customer/gift-cards" },
    { label: "Events", href: "/customer/events" },
];

const SUPPORT_LINKS = [
    {
        label: "Help Center",
        href: "/support#help",
    },
    {
        label: "Customer Service",
        href: "/support#service",
    },
    {
        label: "Refund Policy",
        href: "/support#refund",
    },
];
interface SocialLink { label: string; href: string; icon: JSX.Element }

const SOCIAL_LINKS: SocialLink[] = [
    {
        label: "Facebook", href: "https://facebook.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
        ),
    },
    {
        label: "Instagram", href: "https://instagram.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        ),
    },
    {
        label: "YouTube", href: "https://youtube.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#060101" />
            </svg>
        ),
    },
    {
        label: "TikTok", href: "https://tiktok.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.28 8.28 0 0 0 4.84 1.56V6.78a4.85 4.85 0 0 1-1.08-.09z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn", href: "https://linkedin.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        ),
    },
];

/* ─────────────────────────────────────────────────────────────
   FOOTER LINK LIST (reusable column)
───────────────────────────────────────────────────────────── */
interface LinkColumnProps {
    heading: string;
    links: FooterLink[];
}

const LinkColumn: FC<LinkColumnProps> = ({ heading, links }) => (
    <div>
        <h3
            style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: F.crimson,
                marginBottom: 20,
                marginTop: 0,
            }}
        >
            {heading}
        </h3>

        <ul
            style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            {links.map((link) => (
                <li key={link.label}>
                    <Link
                        to={link.href}
                        style={{
                            color: F.textSecondary,
                            textDecoration: "none",
                            fontSize: 13,
                            letterSpacing: "0.01em",
                            transition: "color .2s",
                            display: "inline-block",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = F.textPrimary)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = F.textSecondary)
                        }
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

/* ─────────────────────────────────────────────────────────────
   NEWSLETTER
───────────────────────────────────────────────────────────── */
const Newsletter: FC = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        // TODO: wire up newsletter API
        setSubmitted(true);
    };

    return (
        <div>
            <h3 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", color: F.crimson,
                marginBottom: 14, marginTop: 0,
            }}>
                Stay Updated
            </h3>
            <p style={{ fontSize: 12.5, color: F.textSecondary, lineHeight: 1.7, marginBottom: 16 }}>
                Get exclusive offers, new releases, and VIP previews delivered to your inbox.
            </p>

            {submitted ? (
                <div style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: F.radius, padding: "10px 14px",
                    fontSize: 12.5, color: "#22c55e",
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <span>✓</span> You're subscribed. Welcome to CGVPremium!
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        aria-label="Email for newsletter"
                        required
                        style={{
                            background: F.inputBg,
                            border: `1px solid ${F.border}`,
                            borderRadius: F.radius,
                            padding: "11px 14px",
                            color: F.textPrimary,
                            fontSize: 13, fontFamily: "inherit",
                            outline: "none",
                            caretColor: F.crimson,
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => { (e.target).style.borderColor = "rgba(232,0,28,0.4)"; }}
                        onBlur={(e) => { (e.target).style.borderColor = F.border; }}
                    />
                    <button
                        type="submit"
                        style={{
                            background: `linear-gradient(135deg,${F.crimson} 0%,${F.crimsonDim} 100%)`,
                            color: "#fff", border: "none",
                            borderRadius: F.radius, padding: "11px",
                            fontSize: 11.5, fontWeight: 700,
                            letterSpacing: "0.16em", textTransform: "uppercase",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "opacity 0.15s, transform 0.15s",
                            boxShadow: "0 4px 16px rgba(232,0,28,0.25)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget).style.opacity = "0.88"; }}
                        onMouseLeave={(e) => { (e.currentTarget).style.opacity = "1"; }}
                    >
                        Subscribe
                    </button>
                </form>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   PAGE FOOTER — main export
───────────────────────────────────────────────────────────── */
const PageFooter: FC = () => (
    <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
            .cgv-footer-grid {
                display: grid;
                grid-template-columns: 1.8fr 1fr 1fr 1fr 1.4fr;
                gap: 48px 40px;
                font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
            }
            .cgv-social-btn {
                display: flex; align-items: center; justify-content: center;
                width: 36px; height: 36px; border-radius: 8px;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.07);
                color: #9a7a7a; cursor: pointer;
                transition: background 0.15s, border-color 0.15s, color 0.15s;
                text-decoration: none;
            }
            .cgv-social-btn:hover {
                background: rgba(232,0,28,0.1);
                border-color: rgba(232,0,28,0.3);
                color: #E8001C;
            }
            @media (max-width: 1100px) {
                .cgv-footer-grid {
                    grid-template-columns: 1fr 1fr 1fr;
                }
            }
            @media (max-width: 680px) {
                .cgv-footer-grid {
                    grid-template-columns: 1fr 1fr;
                    gap: 36px 24px;
                }
            }
            @media (max-width: 420px) {
                .cgv-footer-grid {
                    grid-template-columns: 1fr;
                    gap: 32px 0;
                }
            }
        `}</style>

        <footer style={{
            background: F.bg,
            borderTop: `1px solid ${F.topBorder}`,
            paddingTop: 64,
            fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
        }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>

                {/* ── MAIN GRID ── */}
                <div className="cgv-footer-grid">

                    {/* Column 1: Brand */}
                    <div>
                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
                            <span style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 20, fontWeight: 700,
                                letterSpacing: "0.08em",
                                background: "linear-gradient(135deg,#ff1a1a,#cc0000,#990000)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                CGVPREMIUM
                            </span>
                            <span style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: F.crimson, marginBottom: 13, flexShrink: 0,
                            }} />
                        </div>

                        <p style={{
                            fontSize: 13, color: F.textSecondary,
                            lineHeight: 1.8, marginBottom: 24, maxWidth: 260,
                        }}>
                            Redefining the cinema experience in Vietnam. Premium screens, luxury seating,
                            and world-class service for every film lover.
                        </p>

                        {/* Social links */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="cgv-social-btn"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <LinkColumn heading="Company" links={QUICK_LINKS} />

                    {/* Column 3: Cinema Services */}
                    <LinkColumn heading="Cinema Services" links={CINEMA_SERVICES} />

                    {/* Column 4: Support */}
                    <LinkColumn heading="Support" links={SUPPORT_LINKS} />

                    {/* Column 5: Newsletter */}
                    <Newsletter />
                </div>

                {/* ── DIVIDER ── */}
                <div style={{
                    height: 1, background: F.border,
                    margin: "48px 0 24px",
                }} />

                {/* ── BOTTOM BAR ── */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap",
                    gap: 12, paddingBottom: 28,
                }}>
                    <p style={{ fontSize: 11.5, color: F.textMuted, letterSpacing: "0.06em", margin: 0 }}>
                        © 2026 CGVPremium Entertainment Systems. All Rights Reserved.
                    </p>
                    <div style={{ display: "flex", gap: 20 }}>
                        {[
                            { label: "Privacy", href: "/privacy" },
                            { label: "Terms", href: "/terms" },
                            { label: "Cookies", href: "/cookies" },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                style={{
                                    fontSize: 11.5, color: F.textMuted,
                                    textDecoration: "none", letterSpacing: "0.04em",
                                    transition: "color 0.15s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget).style.color = F.textSecondary; }}
                                onMouseLeave={(e) => { (e.currentTarget).style.color = F.textMuted; }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    </>
);

export default PageFooter;