import { Outlet } from "react-router-dom";

export default function ManagerLayout() {
    return (
        <div>
            Manager Sidebar

            <main>
                <Outlet />
            </main>
        </div>
    );
}