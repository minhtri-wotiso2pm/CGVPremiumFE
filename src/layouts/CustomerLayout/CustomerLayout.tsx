import { Outlet } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";

export default function CustomerLayout() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <PageHeader />
            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Outlet />
            </main>
            <PageFooter />
        </div>
    );
}