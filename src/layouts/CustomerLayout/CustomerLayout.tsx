import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
    return (
        <div>
            Customer Sidebar

            <main>
                <Outlet />
            </main>
        </div>
    );
}