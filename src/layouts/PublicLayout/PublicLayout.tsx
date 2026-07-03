import { Outlet, ScrollRestoration } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";

export default function PublicLayout() {
    return (
        <>
            <ScrollRestoration />
            <PageHeader />
            <main style={{ paddingTop: "var(--cgv-fh-clearance)" }}>
                <Outlet />
            </main>
            <PageFooter />
        </>
    );
}