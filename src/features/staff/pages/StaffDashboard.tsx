import { Link } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function StaffDashboard() {
    const dispatch = useAppDispatch();

    return (
        <>
            <h1>Staff Dashboard</h1>

            <button
                onClick={() => dispatch(logout())}
            >
                Logout
            </button>

            <Link to="/admin/dashboard">
                Go Admin
            </Link>
        </>
    );
}