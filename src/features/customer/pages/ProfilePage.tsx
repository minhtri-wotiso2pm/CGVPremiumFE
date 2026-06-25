import { useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const T = {
    crimson: "#E8001C",
    crimsonDim: "#b50016",
    bg: "#0c0101",
    surface: "rgba(14,5,5,0.95)",
    textPrimary: "#e8e0e0",
    textMuted: "#9a7a7a",
    textLabel: "#6b4a4a",
    borderBase: "rgba(255,255,255,0.07)",
    radius: "12px",
    radiusCard: "18px",
};

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const auth = useAuth();

    const user = auth.user;

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return "#22c55e";
            case "INACTIVE":
                return "#ef4444";
            default:
                return "#f59e0b";
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');

                .dashboard-root {
                    font-family: 'Inter', sans-serif;
                }

                .dashboard-card {
                    animation: fadeUp 0.5s ease;
                }

                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .dashboard-btn:hover {
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <div
                className="dashboard-root"
                style={{
                    minHeight: "100vh",
                    background: T.bg,
                    padding: "40px 20px",
                    color: T.textPrimary,
                }}
            >
                {/* Header */}
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
                    Profile Dashboard
                </p>

                <div
                    className="dashboard-grid"
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "320px 1fr",
                        gap: "24px",
                    }}
                >
                    {/* Left Card */}
                    <div
                        className="dashboard-card"
                        style={{
                            background: T.surface,
                            borderRadius: T.radiusCard,
                            border: `1px solid ${T.borderBase}`,
                            padding: "28px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {user?.avatarURL ? (
                                <img
                                    src={user.avatarURL}
                                    alt={user.fullName}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `3px solid ${T.crimson}`,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonDim})`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 38,
                                        fontWeight: 700,
                                        color: "#fff",
                                    }}
                                >
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <h2
                                style={{
                                    marginTop: 18,
                                    marginBottom: 6,
                                    fontSize: 22,
                                }}
                            >
                                {user?.fullName}
                            </h2>

                            <p
                                style={{
                                    color: T.textMuted,
                                    margin: 0,
                                }}
                            >
                                {user?.email}
                            </p>

                            <span
                                style={{
                                    marginTop: 14,
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: `${getStatusColor(
                                        user?.status
                                    )}20`,
                                    color: getStatusColor(user?.status),
                                }}
                            >
                                {user?.status.toUpperCase()}
                            </span>
                        </div>

                        <button
                            className="dashboard-btn"
                            onClick={handleLogout}
                            style={{
                                width: "100%",
                                marginTop: 28,
                                padding: "14px",
                                borderRadius: T.radius,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 700,
                                color: "#fff",
                                background: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonDim})`,
                                transition: "all 0.2s ease",
                            }}
                        >
                            Logout
                        </button>
                    </div>

                    {/* Right Card */}
                    <div
                        className="dashboard-card"
                        style={{
                            background: T.surface,
                            borderRadius: T.radiusCard,
                            border: `1px solid ${T.borderBase}`,
                            padding: "32px",
                        }}
                    >
                        <h2
                            style={{
                                marginTop: 0,
                                marginBottom: 24,
                            }}
                        >
                            Profile Information
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gap: "18px",
                            }}
                        >
                            <InfoRow
                                label="User ID"
                                value={String(user?.userID ?? "-")}
                            />

                            <InfoRow
                                label="Full Name"
                                value={user?.fullName ?? "-"}
                            />

                            <InfoRow
                                label="Email"
                                value={user?.email ?? "-"}
                            />

                            <InfoRow
                                label="Role"
                                value={user?.role ?? "-"}
                            />

                            <InfoRow
                                label="Status"
                                value={user?.status.toUpperCase() ?? "-"}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "16px",
                                marginTop: "36px",
                            }}
                        >
                            <button
                                className="dashboard-btn"
                                onClick={() => navigate("/profile")}
                                style={actionButton}
                            >
                                Edit Profile
                            </button>

                            <button
                                className="dashboard-btn"
                                onClick={() =>
                                    navigate("/change-password")
                                }
                                style={actionButton}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <span
                style={{
                    color: "#6b4a4a",
                    fontWeight: 600,
                    minWidth: "120px",
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color: "#e8e0e0",
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}

const actionButton: React.CSSProperties = {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#e8e0e0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: 600,
};