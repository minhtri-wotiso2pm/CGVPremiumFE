
import type { FC } from "react";
import { Spin } from "antd";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import {
    SearchOutlined,
    DownOutlined,
    FilterOutlined,
} from "@ant-design/icons";
const WalletPage: FC = () => {
    const { data, isLoading, isError } = useWallet();

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ textAlign: "center", padding: 60 }}>
                Failed to load wallet.
            </div>
        );
    }

    return (
        <div
            style={{
                background: "#111",
                border: "1px solid rgba(232,0,28,0.45)",
                borderRadius: 18,
                padding: 40,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
        >
            <h1
                style={{
                    color: "#fff",
                    fontSize: 30,
                    marginBottom: 30,
                    fontWeight: 700,
                }}
            >
                💳 EGift Wallet
            </h1>

            {/* Visa Style Wallet Card */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg,#050505 0%,#1a1a1a 35%,#5b000c 70%,#E8001C 100%)",
                    borderRadius: 24,
                    padding: 32,
                    minHeight: 230,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.08)",
                    boxShadow: "0 18px 40px rgba(232,0,28,.35)",
                }}
            >
                {/* Background Circles */}
                <div
                    style={{
                        position: "absolute",
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.05)",
                        top: -90,
                        right: -60,
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.04)",
                        bottom: -60,
                        left: -40,
                    }}
                />

                {/* Header */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: "#d1d1d1",
                                fontSize: 13,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                            }}
                        >
                            EGift Wallet
                        </div>

                        <div
                            style={{
                                color: "#fff",
                                fontSize: 30,
                                fontWeight: 700,
                                marginTop: 6,
                            }}
                        >
                            Cinema Wallet
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: 38,
                        }}
                    >
                        🎬
                    </div>
                </div>

                {/* Fake Chip */}
                <div
                    style={{
                        marginTop: 28,
                        width: 54,
                        height: 40,
                        borderRadius: 8,
                        background:
                            "linear-gradient(135deg,#f7d774,#c99d28,#f7d774)",
                        position: "relative",
                        zIndex: 2,
                    }}
                />

                {/* Balance */}
                <div
                    style={{
                        marginTop: 30,
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    <div
                        style={{
                            color: "#d9d9d9",
                            fontSize: 13,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                        }}
                    >
                        Current Balance
                    </div>

                    <div
                        style={{
                            color: "#fff",
                            fontSize: 42,
                            fontWeight: 700,
                            marginTop: 10,
                        }}
                    >
                        {data?.balance?.toLocaleString("vi-VN")} ₫
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: "absolute",
                        left: 32,
                        right: 32,
                        bottom: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#ddd",
                        fontSize: 13,
                        zIndex: 2,
                    }}
                >
                    <span>Digital Wallet</span>

                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 22,
                            letterSpacing: ".08em",
                        }}
                    >
                        CGV PREMIUM
                    </span>
                </div>
            </div>

            {/* Transaction History */}
            {/* Transaction History */}
            <div
                style={{
                    marginTop: 32,
                }}
            >
                <div
                    style={{
                        background: "#1a1a1a",
                        border: "2px solid #E8001C",
                        borderRadius: 16,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "18px 24px",
                            borderBottom: "1px solid rgba(232,0,28,.25)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                color: "#fff",
                                fontSize: 20,
                                fontWeight: 700,
                            }}
                        >
                            Transaction History
                        </span>

                        {/* Search */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            {/* Search */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#111",
                                    border: "1px solid rgba(232,0,28,.45)",
                                    borderRadius: 8,
                                    padding: "0 12px",
                                    width: 260,
                                    height: 40,
                                }}
                            >
                                <SearchOutlined
                                    style={{
                                        color: "#888",
                                        marginRight: 8,
                                        fontSize: 16,
                                    }}
                                />

                                <input
                                    type="text"
                                    placeholder="Search transaction..."
                                    style={{
                                        flex: 1,
                                        background: "transparent",
                                        border: "none",
                                        outline: "none",
                                        color: "#fff",
                                        fontSize: 14,
                                    }}
                                />
                            </div>

                            {/* Filter */}
                            <button
                                style={{
                                    height: 40,
                                    padding: "0 16px",
                                    borderRadius: 8,
                                    border: "1px solid rgba(232,0,28,.45)",
                                    background: "#111",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                <FilterOutlined />
                                Filter
                                <DownOutlined style={{ fontSize: 11 }} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        style={{
                            minHeight: 280,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Transaction list */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#777",
                                fontSize: 15,
                            }}
                        >
                            No transactions yet
                        </div>

                        {/* Load More */}
                        <div
                            style={{
                                borderTop: "1px solid rgba(232,0,28,.2)",
                                padding: "14px 0",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                color: "#E8001C",
                                fontWeight: 600,
                                transition: "0.2s",
                            }}
                        >
                            <span>Load more information</span>

                            <DownOutlined
                                style={{
                                    fontSize: 12,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;