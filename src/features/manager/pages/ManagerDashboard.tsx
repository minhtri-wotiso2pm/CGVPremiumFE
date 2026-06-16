import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function ManagerDashboard() {
    const dispatch = useAppDispatch();

    return (
        <>
            <h1>Manager Dashboard</h1>

            <button
                onClick={() => dispatch(logout())}
            >
                Logout
            </button>
        </>
    );
}