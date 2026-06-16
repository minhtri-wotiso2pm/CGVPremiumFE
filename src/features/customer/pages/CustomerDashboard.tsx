import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function CustomerDashboard() {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    return (
        <>
            <h1>Customer Dashboard</h1>

            <p>
                Xin chào: {auth.user?.fullName}
            </p>

            <p>
                Email: {auth.user?.email}
            </p>


            <button
                onClick={() => dispatch(logout())}
            >
                Logout
            </button>
        </>
    );
}