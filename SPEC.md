# Simple Blog - Project Specifications

## 1. Tổng quan dự án (Overview)
- **Tên dự án:** Simple Blog
- **Mô tả:** Ứng dụng web blog cá nhân cho phép người dùng đăng ký, đăng nhập, viết bài, quản lý bài viết của mình, và tương tác (bình luận, like) trên bài viết của người khác.
- **Tech Stack:**
  - **Frontend:** Next.js (App Router, Server Actions), React, TypeScript, Tailwind CSS.
  - **Backend & Database:** Supabase (PostgreSQL, GoTrue Auth, Realtime, Storage, RLS).

## 2. Kiến trúc dữ liệu (Database Schema)

### 2.1 Tables
- **`profiles`**: Bảng mở rộng thông tin người dùng từ `auth.users`.
  - `id` (UUID, PK, FK tới `auth.users.id`)
  - `display_name` (Text, Nullable)
  - `avatar_url` (Text, Nullable)
  - `created_at` (TimestampTZ)
  - `updated_at` (TimestampTZ)
- **`posts`**: Lưu trữ bài viết của blog.
  - `id` (UUID, PK)
  - `author_id` (UUID, FK tới `profiles.id`)
  - `title` (Text)
  - `slug` (Text, Unique)
  - `content` (Text)
  - `excerpt` (Text)
  - `status` (Enum: 'draft', 'published')
  - `created_at` (TimestampTZ)
  - `updated_at` (TimestampTZ)
  - `published_at` (TimestampTZ, Nullable)
- **`comments`**: Bình luận của người dùng trên bài viết.
  - `id` (UUID, PK)
  - `post_id` (UUID, FK tới `posts.id`)
  - `author_id` (UUID, FK tới `profiles.id`)
  - `content` (Text)
  - `created_at` (TimestampTZ)
- **`likes`** (Bonus): Lưu trữ lượt thích bài viết.
  - `post_id` (UUID, FK tới `posts.id`)
  - `user_id` (UUID, FK tới `profiles.id`)
  - *Primary Key: (post_id, user_id)*

### 2.2 Database Triggers
- Tự động chèn dòng vào bảng `profiles` khi có user đăng ký mới trong `auth.users`.
- Tự động tạo URL-friendly `slug` từ `title` trước khi Insert một `post`.
- Tự động cập nhật trường `updated_at` mỗi khi có thay đổi trên `profiles` hoặc `posts`.

### 2.3 Row Level Security (RLS) Policies
- **`profiles`**: Mọi người đều có thể SELECT. Chỉ user đang đăng nhập (authenticated) mới có thể UPDATE chính profile của họ.
- **`posts`**: 
  - SELECT: Ai cũng xem được bài viết `status = 'published'`. Tác giả xem được toàn bộ bài viết của mình (kể cả `draft`).
  - INSERT: Chỉ user đã đăng nhập được tạo.
  - UPDATE/DELETE: Chỉ tác giả bài viết mới có quyền sửa/xóa bài của mình.
- **`comments`**: 
  - SELECT: Ai cũng xem được bình luận của các bài viết đã 'published'.
  - INSERT: Chỉ user đã đăng nhập được tạo bình luận.
  - DELETE: Chỉ tác giả bình luận (hoặc tác giả bài viết) được quyền xóa.
- **`likes`**:
  - SELECT: Mọi người có thể xem lượt thích.
  - INSERT/DELETE: User chỉ được like/unlike với user_id của chính họ.

## 3. Cấu trúc thư mục (Directory Structure)
```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── auth/callback/route.ts
│   ├── dashboard/
│   │   ├── edit/[id]/page.tsx
│   │   ├── new/page.tsx
│   │   └── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── profile/page.tsx           # Bonus
│   ├── search/page.tsx            # Bonus
│   ├── actions/auth.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Trang chủ
├── components/
│   ├── auth/                      # Login & Register Forms
│   ├── dashboard/                 # Quản lý Post (Forms, Lists, Delete btn)
│   ├── layout/                    # Header, Footer
│   └── posts/                     # Post Detail, Comment Form & List, Like btn
├── lib/
│   └── supabase/                  # Supabase clients (client, server, middleware)
└── types/
    └── database.ts                # TypeScript interfaces/types
middleware.ts
```

## 4. Đặc tả tính năng (Features & Logic)

### 4.1. Authentication & Authorization
- **Đăng ký / Đăng nhập:** Dùng Email/Password thông qua `supabase.auth.signUp` / `signInWithPassword`.
- **OAuth:** Đăng nhập một chạm với GitHub qua `signInWithOAuth`.
- **Middleware:** Cập nhật (refresh) JWT token tự động và ngăn chặn người dùng chưa đăng nhập truy cập các protected routes (`/dashboard`, `/profile`). Chuyển hướng người dùng đã đăng nhập ra khỏi trang `/login` và `/register`.

### 4.2. Public Pages (Trang công khai)
- **Trang chủ (`/`)**: Truy xuất và hiển thị danh sách các bài viết có `status = 'published'` (sắp xếp mới nhất). Tích hợp phân trang (Pagination).
- **Chi tiết bài viết (`/posts/[slug]`)**: 
  - Hiển thị đầy đủ nội dung bài viết.
  - Tích hợp `react-markdown` để render nội dung.
  - Hiển thị danh sách bình luận (có cập nhật Realtime).
  - Có form để viết bình luận (ẩn đi hoặc yêu cầu đăng nhập nếu user là khách).

### 4.3. Protected Pages (Trang bảo mật)
- **Dashboard (`/dashboard`)**: Hiển thị tất cả bài viết của user đang đăng nhập (bao gồm bản nháp và đã xuất bản). Cung cấp nút chuyển đến trang Viết bài và Chỉnh sửa.
- **Tạo/Chỉnh sửa Bài viết**: 
  - Cung cấp form gồm Tiêu đề, Tóm tắt, Nội dung, và Trạng thái.
  - Nếu tạo mới: Gọi `supabase.from('posts').insert()`.
  - Nếu chỉnh sửa: Fetch dữ liệu cũ để điền vào form, gọi `.update()`.
- **Xóa Bài viết**: Có hộp thoại xác nhận trước khi gọi `.delete()`.

### 4.4. Tính năng nâng cao (Bonus)
- **User Profile (`/profile`)**: Form cho phép user đổi tên `display_name` và cập nhật ảnh đại diện `avatar_url`.
- **Supabase Storage**: 
  - Tạo bucket `blog-images`.
  - Cung cấp API/Server Action để xử lý upload file từ frontend và trả về Public URL, dùng để chèn vào nội dung bài viết hoặc cập nhật ảnh đại diện.
- **Like/Unlike**: 
  - Hiển thị số lượng thích bài viết realtime (hoặc qua data fetching ban đầu).
  - Giao diện dạng Toggle button (thêm/xóa dòng tương ứng trong bảng `likes`).
- **Full-text Search (`/search?q=...`)**: 
  - Truy vấn `posts` bằng textSearch của Supabase để tìm trong `title` hoặc `content`.