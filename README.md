# CGV Premium Frontend (cgv-premium2)

Hướng dẫn này mô tả cách thiết lập và chạy dự án frontend cgv-premium2 trên máy local.

## Yêu cầu trước

- Node.js 18.x hoặc mới hơn (Node 18/20 được khuyến nghị)
- npm (kèm theo Node) hoặc yarn
- Mạng có quyền truy cập tới backend API (hoặc mock API) nếu cần

## Sao chép mã nguồn

```bash
git clone https://github.com/minhtri-wotiso2pm/CGVPremiumFE.git
cd CGVPremiumFE/FE/cgv-premium2
```

(hoặc clone từ remote mà bạn đang dùng và chuyển vào thư mục dự án)

## Cài đặt phụ thuộc

Chạy một trong các lệnh sau để cài dependencies:

```bash
npm install
# hoặc
# yarn install
```

## Biến môi trường

Dự án sử dụng Vite và `import.meta.env` cho cấu hình môi trường. Tạo file `.env` ở thư mục gốc dự án (không commit file này nếu chứa secret).

Ví dụ `.env` (đặt tại `FE/cgv-premium2/.env`):

```
VITE_API_BASE_URL=https://api.example.com
# VITE_OTHER_KEY=...
```

- `VITE_API_BASE_URL` là URL gốc của backend API (axios instance sử dụng biến này). Điều chỉnh theo môi trường của bạn.

## Chạy ở môi trường phát triển

```bash
npm run dev
```

- Vite server mặc định chạy ở http://localhost:5173 (nếu port khác sẽ hiển thị trong console)
- Để thay đổi port, có thể đặt `PORT` trong lệnh khởi chạy hoặc cấu hình Vite.

## Build cho production

```bash
npm run build
```

Lệnh trên sẽ chạy TypeScript build rồi Vite build. Kết quả đóng gói sẽ nằm trong thư mục `dist/`.

Xem bản build bằng:

```bash
npm run preview
```

## Lint

Chạy ESLint:

```bash
npm run lint
```

## Các lệnh hữu ích khác

- `npm run dev` — chạy development server
- `npm run build` — build production
- `npm run preview` — phục vụ build tạm để kiểm tra
- `npm run lint` — kiểm tra lint

## Cấu trúc chính của dự án

- `src/` — mã nguồn chính
  - `features/` — các module theo tính năng (admin, customer, manager, staff, ...)
  - `components/` — các component UI dùng chung
  - `services/` — axios + api service
  - `store/` — Redux store (nếu có)
  - `layouts/`, `providers/`, `styles/`, `types/`, `utils/` ...

## Lưu ý khi phát triển

- Mọi config `import.meta.env` phải bắt đầu bằng `VITE_` để Vite expose cho client.
- Không commit secrets hoặc file `.env` vào git.
- Nếu backend chưa sẵn sàng, cân nhắc dùng mock server hoặc thiết lập proxy trong vite config.

## Gặp sự cố

- Nếu gặp lỗi khi chạy `npm run dev` hoặc `npm run build`, kiểm tra:
  - Node version (dùng `node -v`)
  - Các biến môi trường cần thiết
  - Lỗi chi tiết từ terminal (TypeScript/ESLint/Vite sẽ chỉ rõ file lỗi)

Nếu cần, gửi báo lỗi kèm log terminal để được hỗ trợ tiếp.

---

Nếu muốn, có thể bổ sung thêm các phần: cách chạy với Docker, hướng dẫn tạo `.env.local` cho nhiều môi trường, hoặc ví dụ cấu hình proxy—bảo tôi biết cụ thể muốn gì.