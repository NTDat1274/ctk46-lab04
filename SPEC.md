# Simple Blog - Project Specifications

## 1. Tổng quan dự án (Overview)
- **Tên dự án:** Simple Blog
- **Mô tả:** Ứng dụng web blog cá nhân cho phép người dùng đăng ký, đăng nhập, viết bài, quản lý bài viết của mình, và tương tác (bình luận, like) trên bài viết của người khác. Bao gồm hệ thống quản trị (Admin Dashboard) dành riêng cho quản trị viên.
- **Tech Stack:**
  - **Frontend:** Next.js (App Router, Server Actions), React, TypeScript, Tailwind CSS.
  - **Backend & Database:** Supabase (PostgreSQL, GoTrue Auth, Realtime, Storage, RLS).

## 2. Kiến trúc dữ liệu (Database Schema)

### 2.1 Tables
- **`profiles`**: Bảng mở rộng thông tin người dùng từ `auth.users`.
  - `id` (UUID, PK, FK tới `auth.users.id`)
  - `display_name` (Text, Nullable)
  - `avatar_url` (Text, Nullable)
  - `role` (Text, Default: 'user') - Phân quyền ('user' hoặc 'admin')
  - `created_at` (TimestampTZ)
  - `updated_at` (TimestampTZ)
- **`categories`**: Danh mục bài viết.
  - `id` (UUID, PK)
  - `name` (Text)
  - `slug` (Text, Unique)
  - `description` (Text, Nullable)
  - `created_at` (TimestampTZ)
- **`posts`**: Lưu trữ bài viết của blog.
  - `id` (UUID, PK)
  - `author_id` (UUID, FK tới `profiles.id`)
  - `category_id` (UUID, Nullable, FK tới `categories.id`)
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
- Tự động chèn dòng vào bảng `profiles` khi có user đăng ký mới trong `auth.users` (default role là 'user').
- Tự động tạo URL-friendly `slug` từ `title` trước khi Insert một `post`.
- Tự động cập nhật trường `updated_at` mỗi khi có thay đổi trên `profiles` hoặc `posts`.

### 2.3 Row Level Security (RLS) Policies
- **`profiles`**: Mọi người đều có thể SELECT. User đăng nhập có thể UPDATE profile của họ. Admin có toàn quyền.
- **`categories`**: Mọi người đều có thể SELECT. Admin có toàn quyền (INSERT, UPDATE, DELETE).
- **`posts`**: 
  - SELECT: Ai cũng xem được bài viết `status = 'published'`. Tác giả xem được toàn bộ bài viết của mình. Admin xem được tất cả.
  - INSERT: Chỉ user đã đăng nhập được tạo.
  - UPDATE/DELETE: Tác giả bài viết hoặc Admin mới có quyền sửa/xóa bài.
- **`comments`**: 
  - SELECT: Ai cũng xem được bình luận.
  - INSERT: Chỉ user đã đăng nhập được tạo bình luận.
  - DELETE: Tác giả bình luận, tác giả bài viết, hoặc Admin được quyền xóa.
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
│   ├── admin/                     # Phân hệ Admin
│   │   ├── layout.tsx             # Admin Sidebar & Header
│   │   ├── dashboard/page.tsx     # Thống kê tổng quan
│   │   ├── categories/page.tsx    # Quản lý danh mục
│   │   ├── posts/page.tsx         # Quản lý bài viết toàn hệ thống
│   │   ├── comments/page.tsx      # Quản lý bình luận
│   │   └── users/page.tsx         # Quản lý người dùng & phân quyền
│   ├── auth/callback/route.ts
│   ├── dashboard/                 # User Dashboard
│   │   ├── edit/[id]/page.tsx
│   │   ├── new/page.tsx
│   │   └── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── profile/page.tsx           # Bonus
│   ├── search/page.tsx            # Bonus
│   ├── actions/
│   │   ├── auth.ts
│   │   └── admin.ts               # Server actions cho Admin
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Trang chủ
├── components/
│   ├── admin/                     # UI cho Admin (Tables, Stats Cards)
│   ├── auth/                      # Login & Register Forms
│   ├── dashboard/                 # Quản lý Post của User
│   ├── layout/                    # Header, Footer
│   └── posts/                     # Post Detail, Comment Form & List, Like btn
├── lib/
│   └── supabase/                  # Supabase clients (client, server, middleware)
└── types/
    └── database.ts                # TypeScript interfaces/types
middleware.ts
```

## 4. Đặc tả tính năng (Features & Logic)

### 4.1. Authentication, Authorization & Middleware
- **Đăng ký / Đăng nhập:** Dùng Email/Password hoặc OAuth (GitHub).
- **Middleware:** Cập nhật JWT token. 
  - `/dashboard`, `/profile`: Yêu cầu đăng nhập.
  - `/admin/*`: Yêu cầu đăng nhập VÀ tài khoản phải có `role === 'admin'`. Nếu không, redirect về `/`.

### 4.2. Public Pages (Trang công khai)
- **Trang chủ (`/`)**: Hiển thị danh sách các bài viết `published`. Tích hợp phân trang. Lọc theo `category` nếu có.
- **Chi tiết bài viết (`/posts/[slug]`)**: Nội dung, Markdown, Bình luận (Realtime).

### 4.3. Protected Pages (User Dashboard)
- **Dashboard (`/dashboard`)**: Quản lý bài viết cá nhân (tạo, sửa, xóa bản nháp/bản publish).

### 4.4. Phân hệ Quản trị (Admin Pages)
- **Dashboard (`/admin/dashboard`)**: Hiển thị số liệu tổng quan (Tổng users, posts, comments).
- **Quản lý Danh mục (`/admin/categories`)**: Tạo, sửa, xóa danh mục bài viết.
- **Quản lý Bài viết (`/admin/posts`)**: Xem toàn bộ bài viết trên hệ thống, quyền đổi trạng thái hoặc xóa bài viết vi phạm.
- **Quản lý Bình luận (`/admin/comments`)**: Xem tất cả bình luận, quyền xóa bình luận.
- **Quản lý Người dùng (`/admin/users`)**: Xem danh sách user, đổi `role` (cấp quyền admin).

### 4.5. Tính năng nâng cao (Bonus)
- **User Profile (`/profile`)**: Đổi tên `display_name`, cập nhật `avatar_url`.
- **Supabase Storage**: Quản lý file hình ảnh bài viết và avatar.
- **Like/Unlike**: Realtime.
- **Full-text Search (`/search?q=...`)**: Tìm kiếm bài viết.
