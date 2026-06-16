import { Outlet } from "react-router-dom";

export default function StaffLayout() {
    return (
        <div>
            Staff Sidebar

            <main>
                <Outlet />
            </main>
        </div>
    );
}