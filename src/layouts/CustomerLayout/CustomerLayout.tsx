import { Outlet, ScrollRestoration } from "react-router-dom";
import { ConfigProvider } from "antd";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";
import ChatWidget from "@/features/aiChat/components/ChatWidget";

export default function CustomerLayout() {
    return (
        // Brand-red primary so antd defaults (Spin dots, primary buttons, etc.)
        // match the CGV theme instead of antd's stock blue.
        <ConfigProvider theme={{ token: { colorPrimary: "#E8001C" } }}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <ScrollRestoration />
                <PageHeader />
                <main style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "var(--cgv-fh-clearance)" }}>
                    <Outlet />
                </main>
                <PageFooter />
                <ChatWidget />
            </div>
        </ConfigProvider>
    );
}