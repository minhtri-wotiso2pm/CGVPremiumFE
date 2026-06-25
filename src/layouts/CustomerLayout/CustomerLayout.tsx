import { Outlet } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader/PageHeaderPublic";
import PageFooter from "@/components/common/PageFooter/PageFooterPublic";

export default function CustomerLayout() {
    return (
        <div>
            <PageHeader />
            <main>
                <Outlet />
            </main>
            <PageFooter />
        </div>
    );
}