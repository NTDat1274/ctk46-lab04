-- Bước 1: Thêm cột 'role' cho bảng profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Bước 2: Tạo bảng categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bước 3: Thêm category_id cho bảng posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Bước 4: Row Level Security (RLS) cho categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone." ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories." ON public.categories
  FOR INSERT WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can update categories." ON public.categories
  FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can delete categories." ON public.categories
  FOR DELETE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Bước 5: Bổ sung RLS policies cho Admin trên các bảng hiện tại (cho phép Admin bỏ qua ràng buộc user)
CREATE POLICY "Admins can update any post." ON public.posts
  FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can delete any post." ON public.posts
  FOR DELETE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can delete any comment." ON public.comments
  FOR DELETE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
