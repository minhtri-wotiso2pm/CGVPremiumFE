import { Outlet, ScrollRestoration } from "react-router-dom";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";
import ChatWidget from "@/features/aiChat/components/ChatWidget";
import { useLanguage } from "@/hooks/useLanguage";

export default function CustomerLayout() {
    const { language } = useLanguage();
    return (
        // Brand-red primary so antd defaults (Spin dots, primary buttons, etc.)
        // match the CGV theme instead of antd's stock blue.
        <ConfigProvider
            locale={language === "vi" ? viVN : enUS}
            theme={{ token: { colorPrimary: "#E8001C" } }}
        >
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