# Tổng quan dự án Frontend `cgv-premium2`

## 1. Mục tiêu và bối cảnh

`cgv-premium2` là frontend của một hệ thống quản lý rạp chiếu phim, được phát triển với React và TypeScript. Dự án hướng đến việc tạo ra một nền tảng giao diện có khả năng mở rộng cao, hỗ trợ phân quyền đa vai trò và kết nối với backend thông qua API chuẩn.

## 2. Tổng quan kiến trúc kỹ thuật

Dự án áp dụng kiến trúc module hóa theo tính năng (feature-based architecture) với các vùng chức năng chính được phân định rõ ràng:

- `src/features/`: chứa các tính năng theo vai trò và nghiệp vụ hàng đầu
- `src/components/`: chứa các component UI tái sử dụng
- `src/services/`: chứa logic gọi API và cấu hình Axios
- `src/store/`: chứa Redux state và slices
- `src/routes/`: chứa cấu hình điều hướng và guard logic
- `src/providers/`: chứa provider để quản lý các context toàn cục

Kiến trúc này cho phép tách riêng các khối concern:

- Presentation layer: component và layout
- State layer: Redux và React Query
- Data layer: API services
- Routing layer: bảo mật và phân quyền

## 3. Công nghệ chính

- React 19 + TypeScript 6
- Vite 8
- Redux Toolkit
- React Router DOM 7
- React Query (@tanstack/react-query)
- Axios
- Ant Design
- Zod

## 4. Thiết lập dự án và quy trình khởi tạo

### 4.1 Kịch bản khởi chạy

- `npm run dev`: khởi động Vite development server
- `npm run build`: chạy TypeScript build và Vite build
- `npm run lint`: kiểm tra mã bằng ESLint
- `npm run preview`: xem bản build đã đóng gói

### 4.2 Luồng khởi tạo ứng dụng

- `src/main.tsx`: cấu hình `Provider` cho Redux store và React Query client, sau đó render `App`
- `src/App.tsx`: tạo router toàn cục bằng `RouterProvider`

### 4.3 Cấu hình môi trường

- `src/services/axios/axiosInstance.ts` sử dụng `import.meta.env.VITE_API_BASE_URL` làm `baseURL`
- Axios instance được thiết lập timeout 10s và interceptor thêm header `Authorization` khi token tồn tại

## 5. Routing và bảo mật truy cập

### 5.1 `src/routes/index.tsx`

- `createBrowserRouter([])` khởi tạo router
- Nơi để mở rộng các route public và protected

### 5.2 `ProtectedRoute`

- Kiểm tra token trong `localStorage`
- Điều hướng về `/login` nếu chưa xác thực

### 5.3 `PermissionRoute`

- Sử dụng hook `useAuth()` để lấy thông tin user
- Chỉ cấp phép truy cập khi role của user nằm trong `allowedRoles`
- Điều hướng về `/403` nếu không có quyền tương ứng

## 6. Quản lý trạng thái và xác thực

### 6.1 Redux

- `src/store/store.ts`: tạo store với cấu hình `auth` reducer
- `src/store/slices/authSlice.ts`: định nghĩa trạng thái xác thực và hành động `loginSuccess`, `logout`

### 6.2 Auth state

- `AuthState` gồm `isAuthenticated`, `accessToken`, `user`
- User object hiện bao gồm `id`, `fullName`, `email`, `role`

## 7. Data access và service layer

### 7.1 Axios

- `axiosInstance` cung cấp một điểm gọi API chung
- Request interceptor tự động gắn `Bearer <token>`

### 7.2 API service

- `src/services/api/auth.service.ts`: thực hiện đăng nhập với `POST /auth/login`
- Các service khác như `movie.service.ts` đã có cấu trúc nhưng chưa được triển khai chi tiết

### 7.3 React Query

- `src/providers/QueryProvider.tsx` khởi tạo `QueryClient`
- Cho phép sử dụng `useQuery` và `useMutation` trong toàn bộ ứng dụng

## 8. Cấu trúc thư mục chính

### 8.1 `src/components`

- Chứa các component UI chung và feedback state:
  - `common/`: `PageHeader`, `SearchBar`
  - `feedback/`: `AccessDenied`, `ErrorBoundary`, `LoadingSpinner`
  - `forms/`: `FormInput`, `FormSelect`
  - `ui/`: `AppButton`, `AppInput`

### 8.2 `src/features`

- Các module theo vai trò: `admin/`, `customer/`, `manager/`, `staff/`
- `auth/`: quản lý xác thực, schema và kiểu dữ liệu
- `booking/`, `movies/`, `common/`: phân chia nghiệp vụ theo domain

### 8.3 `src/layouts`

- Có layout riêng cho từng nhóm người dùng: `AdminLayout`, `CustomerLayout`, `ManagerLayout`, `PublicLayout`, `StaffLayout`

### 8.4 `src/providers`

- `AppProvider.tsx`: placeholder cho future provider chung
- `QueryProvider.tsx`: provider cho React Query

### 8.5 `src/constants`

- `roles.ts`, `permissions.ts`, `routes.ts`, `storageKeys.ts`, `queryKeys.ts`
- Định nghĩa các giá trị cứng giúp đảm bảo tính nhất quán

### 8.6 `src/services`

- `api/`: định nghĩa các service gọi API
- `axios/`: cấu hình Axios chung

### 8.7 `src/styles`

- `antd-theme.ts`, `global.css`, `variables.css`
- Dùng để quản lý theme và style toàn cục

### 8.8 `src/types`

- Định nghĩa các kiểu dữ liệu chung cho API, auth và pagination

### 8.9 `src/utils`

- Các hàm tiện ích cho định dạng và kiểm tra dữ liệu
- `formatCurrency.ts`, `formatDate.ts`, `helpers.ts`, `storage.ts`, `validators.ts`

## 9. Đặc điểm nổi bật của kiến trúc

- Tách biệt rõ ràng giữa giao diện và logic nghiệp vụ
- Hỗ trợ phát triển nhiều vai trò người dùng và phân quyền chi tiết
- Hệ thống provider giúp mở rộng state management và data fetching tối ưu
- Cấu trúc file rõ ràng, dễ mở rộng khi thêm tính năng mới

## 10. Trạng thái hiện tại và lưu ý

- Routing hiện tại chưa chứa route cụ thể, cần hoàn thiện cấu hình cho các trang
- `useAuth.ts` và một số service `movie.service.ts` đang ở dạng skeleton
- `AppProvider.tsx` chưa có nội dung, mở ra khả năng thêm context hoặc theme provider
- Dự án có nền tảng tốt nhưng cần bổ sung các route, các service API và hook auth để hoàn chỉnh

## 11. Tổng quan cấu trúc component

### 11.1 Cây component chính

- `src/main.tsx`
  - `Provider` (Redux)
  - `QueryClientProvider` (React Query)
  - `App`
- `src/App.tsx`
  - `RouterProvider`
  - `router`: điểm mở rộng cho route public và protected
- Route wrapper
  - `ProtectedRoute`: bảo vệ trang bằng token
  - `PermissionRoute`: phân quyền theo role
- Layout
  - `PublicLayout`
  - `AdminLayout`
  - `CustomerLayout`
  - `ManagerLayout`
  - `StaffLayout`
- Feature page
  - `auth/pages`: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`
  - `customer/pages`: `CustomerDashboardPage`, `MyTicketsPage`, `ProfilePage`
  - `admin/pages`: `AdminDashboard`, `AccountManagementPage`, `ActivityLogPage`
  - `manager/pages`: `ManagerDashboard`, `MovieManagementPage`, `PromotionManagementPage`, `RevenueDashboardPage`
  - `staff/pages`: `StaffDashboard`, `CheckInPage`, `CounterBookingPage`, `RefundPage`
- Shared component
  - `components/common`: `PageHeader`, `SearchBar`
  - `components/forms`: `FormInput`, `FormSelect`
  - `components/ui`: `AppButton`, `AppInput`
  - `components/feedback`: `LoadingSpinner`, `ErrorBoundary`, `AccessDenied`

### 11.2 Vai trò component

- Layout tạo khung giao diện và nhận dữ liệu đầu vào từ route
- Page component chịu trách nhiệm hiển thị nghiệp vụ theo từng chức năng
- Shared component đảm bảo tính tái sử dụng và nhất quán giao diện
- Route wrapper thực thi logic bảo mật trước khi render page

## 12. Luồng dữ liệu

### 12.1 Luồng đăng nhập

- Người dùng nhập thông tin trên `LoginPage`
- Page component gọi `loginApi` trong `src/services/api/auth.service.ts`
- `axiosInstance` gửi request đến backend với `VITE_API_BASE_URL`
- Nếu tồn tại token, interceptor thêm header `Authorization`
- Backend trả về dữ liệu, Redux cập nhật qua action `loginSuccess`
- `useAuth()` đọc `auth` state và cung cấp thông tin cho `PermissionRoute`
- `ProtectedRoute` / `PermissionRoute` quyết định route tiếp theo

### 12.2 Luồng nghiệp vụ chung

- Component nhận input từ người dùng qua các form
- Dữ liệu được xác thực và chuẩn hóa trước khi gọi service
- Service layer thực hiện gọi API qua `axiosInstance`
- Kết quả API có thể được lưu trong Redux hoặc quản lý bởi React Query
- UI render lại dựa trên state từ `useAppSelector` hoặc hook query

### 12.3 Xử lý trạng thái và lỗi

- `LoadingSpinner` biểu diễn trạng thái tải dữ liệu
- `ErrorBoundary` ghi nhận lỗi runtime và hiển thị fallback
- `AccessDenied` đảm bảo feedback khi user không đủ quyền

## 13. Hướng dẫn tiếp cận cho người mới

1. Đọc `src/main.tsx` để hiểu cách cài đặt provider và render app
2. Kiểm tra `src/App.tsx` và `src/routes/index.tsx` để nắm luồng định tuyến
3. Xem `src/store/slices/authSlice.ts` để hiểu state auth
4. Kiểm tra `src/services/axios/axiosInstance.ts` để hiểu cấu hình gọi API chung
5. Dò qua `src/features/` và `src/layouts/` để hình dung phân chia nghiệp vụ và thành phần UI

## 14. Kết luận

`cgv-premium2` là một frontend có cấu trúc rõ ràng, phù hợp cho ứng dụng doanh nghiệp nhiều vai trò. Kiến trúc hiện tại ưu tiên modularity, phân quyền và khả năng mở rộng, nhưng vẫn cần hoàn thiện các route và service để trở thành một hệ thống sản xuất hoàn chỉnh.
