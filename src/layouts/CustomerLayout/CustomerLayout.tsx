import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}