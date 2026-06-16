import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function AdminDashboard() {
    const dispatch = useAppDispatch();

    return (
        <>
            <h1>Admin Dashboard</h1>

            <button
                onClick={() => dispatch(logout())}
            >
                Logout
            </button>
        </>
    );
}