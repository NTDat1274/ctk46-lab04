-- 1. Create Tables
-- Bảng profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Bảng comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng likes
CREATE TABLE likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 2. Create Triggers & Functions
-- Hàm tự động tạo profile khi đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Hàm cập nhật updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_posts_updated
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Hàm tạo slug cho posts
CREATE OR REPLACE FUNCTION public.handle_post_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '\s+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_posts_insert_slug
  BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_post_slug();


-- 3. Row Level Security (RLS) Policies

-- Bật RLS cho tất cả các bảng
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policies cho profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies cho posts
CREATE POLICY "Published posts are viewable by everyone." ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view all their own posts." ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts." ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts." ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts." ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Policies cho comments
CREATE POLICY "Comments are viewable by everyone." ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments." ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments." ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Policies cho likes
CREATE POLICY "Likes are viewable by everyone." ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes." ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes." ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Storage Bucket (Optional)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);
-- Và tạo policy tương ứng trên giao diện Storage
