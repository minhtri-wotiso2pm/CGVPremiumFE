import { type FC } from "react";
import { Spin } from "antd";
import { useWallet } from "../hooks/useWallet";

const WalletPage: FC = () => {
    const { data, isLoading } = useWallet();

    if (isLoading) return <Spin />;

    return (
        <div
            style={{
                background: "#160606",
                borderRadius: 14,
                padding: 40,
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    color: "#fff",
                    fontSize: 28,
                }}
            >
                EGift Wallet
            </h1>

            <p
                style={{
                    color: "#aaa",
                    marginTop: 20,
                }}
            >
                Current Balance
            </p>

            <h2
                style={{
                    color: "#4ade80",
                    fontSize: 40,
                }}
            >
                {data?.balance?.toLocaleString("vi-VN")} ₫
            </h2>
        </div>
    );
};

export default WalletPage;