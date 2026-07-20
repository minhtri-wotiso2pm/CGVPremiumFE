import { Outlet, ScrollRestoration } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";
import ChatWidget from "@/features/aiChat/components/ChatWidget";

export default function WelcomeLayout() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <ScrollRestoration />
            <PageHeader />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "var(--cgv-fh-clearance)" }}>
                <Outlet />
            </main>
            <PageFooter />
            <ChatWidget />
        </div>
    );
}
