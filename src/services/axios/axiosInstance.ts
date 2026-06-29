import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { notify } from "@/utils/notify";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "ngrok-skip-browser-warning": "true",
    },
    timeout: 10000,
});

/* ── Request: gắn Bearer token ── */
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ── Response: xử lý 401 Unauthorized ── */
// Flag tránh nhiều request 401 đồng thời trigger nhiều lần
let isHandling401 = false;

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status: number | undefined = error.response?.status;
        const requestUrl: string = error.config?.url ?? "";

        // Bỏ qua 401 từ login (sai mật khẩu, không phải hết session)
        const isAuthLoginEndpoint = requestUrl.includes("/auth/login");

        if (status === 401 && !isAuthLoginEndpoint && !isHandling401) {
            isHandling401 = true;

            // Xóa Redux state + localStorage.
            // ProtectedRoute đọc isAuthenticated từ Redux → tự navigate("/login") qua React Router
            // → không reload trang, không bị load 2 lần.
            store.dispatch(logout());

            notify.warning(
                "Phiên đăng nhập đã hết hạn",
                "Vui lòng đăng nhập lại để tiếp tục."
            );

            // Reset flag sau khi redirect hoàn tất
            setTimeout(() => { isHandling401 = false; }, 2000);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
