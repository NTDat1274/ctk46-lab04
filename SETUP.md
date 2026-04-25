# Hướng dẫn cài đặt và chạy dự án Simple Blog

Chào bạn! Tài liệu này được biên soạn dành riêng cho người mới bắt đầu làm quen với Next.js và Supabase. Nó sẽ hướng dẫn bạn từng bước từ việc tạo dự án trên Supabase cho đến khi ứng dụng chạy thành công trên máy tính của bạn.

## 📌 Phần 1: Yêu cầu chuẩn bị (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
1. **Node.js**: Phiên bản 18 trở lên. Bạn có thể tải tại [nodejs.org](https://nodejs.org/).
2. **Trình soạn thảo code (IDE)**: Khuyến nghị dùng [Visual Studio Code (VS Code)](https://code.visualstudio.com/).
3. **Tài khoản Supabase**: Đăng ký miễn phí tại [supabase.com](https://supabase.com/).

---

## 📌 Phần 2: Thiết lập cơ sở dữ liệu trên Supabase

Supabase là nền tảng Backend-as-a-Service (BaaS) cung cấp Database (PostgreSQL), Authentication (Xác thực) và Storage (Lưu trữ file).

### Bước 2.1: Tạo dự án mới
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard).
2. Nhấn nút **"New Project"**.
3. Chọn Organization (tổ chức) của bạn, nhập tên dự án (ví dụ: `simple-blog`), tạo một mật khẩu mạnh cho Database và chọn Region gần bạn (như Singapore).
4. Nhấn **"Create new project"**. (Quá trình này mất khoảng 1-2 phút để Supabase khởi tạo).

### Bước 2.2: Khởi tạo Database (Bảng, Triggers và Bảo mật - RLS)
Dự án này đã có sẵn file `supabase_setup.sql` chứa toàn bộ cấu trúc cơ sở dữ liệu.
1. Ở menu bên trái của Supabase Dashboard, chọn **"SQL Editor"** (biểu tượng mã code `</>`).
2. Nhấn **"New query"**.
3. Mở file `supabase_setup.sql` trong mã nguồn dự án của bạn (nằm ở thư mục gốc), copy toàn bộ nội dung bên trong.
4. Dán vào khung soạn thảo của SQL Editor trên Supabase.
5. Nhấn nút **"Run"** ở góc dưới cùng bên phải.
   *Nếu chạy thành công, bạn sẽ thấy thông báo "Success" và các bảng `profiles`, `posts`, `comments`, `likes` đã được tạo.*

### Bước 2.3: Cấu hình Authentication (Xác thực người dùng)
1. Ở menu bên trái, chọn **"Authentication"** (biểu tượng hình người).
2. Chọn mục **"Providers"** (hoặc "Configuration" > "Providers").
3. Nhấn vào **"Email"**, đảm bảo nút gạt "Enable Email provider" đang bật (màu xanh).
4. Trong dự án này, để đơn giản cho việc test ở môi trường dev, bạn có thể **tắt tính năng "Confirm email"** (Xác nhận email) để người dùng có thể đăng nhập ngay sau khi đăng ký mà không cần vào email lấy link. Nhấn **"Save"**.

### Bước 2.4: Thiết lập Storage (Lưu trữ hình ảnh)
1. Ở menu bên trái, chọn **"Storage"** (biểu tượng hình hộp/thùng chứa).
2. Nhấn **"New Bucket"**.
3. Đặt tên bucket chính xác là: `blog-images`.
4. **Quan trọng:** Bật tùy chọn **"Public bucket"** để ai cũng có thể xem được ảnh, sau đó nhấn **"Save"**.
5. Cấp quyền upload ảnh:
   - Trong màn hình Storage, chuyển sang tab **"Policies"**.
   - Ở phần `blog-images`, nhấn **"New policy"**.
   - Chọn **"For full customization"** (Cấu hình nâng cao).
   - Đặt tên Policy: `Cho phép user đã đăng nhập upload ảnh`
   - Allowed operation (Hành động cho phép): Tick vào **INSERT**, **UPDATE**, **SELECT**.
   - Target roles (Đối tượng): Chọn `authenticated` (người dùng đã đăng nhập).
   - Nhấn **"Review"** rồi **"Save policy"**.

---

## 📌 Phần 3: Kết nối mã nguồn Next.js với Supabase

Bây giờ bạn cần báo cho mã nguồn biết cách kết nối với dự án Supabase vừa tạo.

### Bước 3.1: Lấy thông tin API Keys
1. Quay lại Supabase Dashboard.
2. Ở menu bên trái dưới cùng, chọn **"Project Settings"** (biểu tượng bánh răng ⚙️).
3. Chọn mục **"API"**.
4. Ở đây bạn sẽ thấy 2 thông tin quan trọng:
   - **Project URL**: (ví dụ: `https://xxxxxx.supabase.co`)
   - **Project API Keys (anon / public)**: Một chuỗi ký tự rất dài.

### Bước 3.2: Cấu hình biến môi trường
1. Mở mã nguồn dự án trong VS Code.
2. Ở thư mục gốc của dự án, tìm file `.env.local` (nếu chưa có thì tạo mới).
3. Điền thông tin bạn vừa copy ở Bước 3.1 vào file này với định dạng sau:

```env
NEXT_PUBLIC_SUPABASE_URL=dán_project_url_của_bạn_vào_đây
NEXT_PUBLIC_SUPABASE_ANON_KEY=dán_anon_key_của_bạn_vào_đây
```
*(Lưu ý: Không để dấu ngoặc kép hay khoảng trắng thừa ở cuối dòng).*

---

## 📌 Phần 4: Chạy dự án trên máy của bạn

Bây giờ mọi thứ đã sẵn sàng. Hãy mở Terminal (hoặc Command Prompt) trong VS Code (phím tắt `Ctrl + \``) và chạy các lệnh sau:

1. **Cài đặt các thư viện cần thiết:**
   ```bash
   npm install
   ```

2. **Khởi động môi trường phát triển (Dev server):**
   ```bash
   npm run dev
   ```

3. Mở trình duyệt web và truy cập vào địa chỉ: **http://localhost:3000**

---

## 🎉 Chúc mừng! Bạn đã hoàn tất cấu hình.

Bây giờ bạn có thể trải nghiệm các tính năng của ứng dụng:
1. Vào **Đăng ký** để tạo một tài khoản mới.
2. Cập nhật **Hồ sơ cá nhân** (thay đổi tên, tải ảnh đại diện).
3. Vào **Dashboard** để tạo **Bài viết mới** (sử dụng Markdown và nút tải ảnh lên).
4. Xuất bản bài viết và xem nó xuất hiện ở **Trang chủ**.
5. Mở bài viết để **Thích** hoặc viết **Bình luận**.

**Mẹo dành cho người mới:**
- Mã nguồn giao diện chính nằm trong thư mục `src/app/`.
- Các hàm giao tiếp với Database (Server Actions) nằm trong `src/app/actions/`.
- Cấu hình kết nối Supabase nằm trong `src/lib/supabase/`.

Nếu gặp lỗi ở bước nào, hãy kiểm tra lại kỹ file `.env.local` hoặc cấu hình Database trên Supabase nhé. Chúc bạn học tốt!
