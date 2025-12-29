-- ============================================
-- OKR PLATFORM DATABASE SCHEMA
-- ============================================
-- Hướng dẫn: Copy toàn bộ file này và chạy trong Supabase SQL Editor
-- Link: https://app.supabase.com/project/_/sql

-- ============================================
-- 1. EXTENSION: Enable UUID
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLE: profiles
-- Lưu thông tin user profile
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLE: objectives
-- Lưu mục tiêu OKR
-- ============================================
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'on-track' CHECK (status IN ('on-track', 'at-risk', 'off-track')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLE: key_results
-- Lưu key results của mỗi objective
-- ============================================
CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  target NUMERIC NOT NULL,
  unit TEXT DEFAULT 'số',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TABLE: team_members
-- Lưu danh sách thành viên team
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 6. INDEXES: Tăng performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_objectives_owner ON public.objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_objectives_created_by ON public.objectives(created_by);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON public.key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_key_results_owner ON public.key_results(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- ============================================
-- 7. FUNCTIONS: Auto update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers cho auto update
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_objectives
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_key_results
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 8. FUNCTION: Tự động tạo profile khi user sign up
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger khi có user mới
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Profiles: User có thể xem và update profile của chính họ
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Objectives: User có thể xem tất cả, chỉ tạo/sửa/xóa của mình
CREATE POLICY "Anyone can view objectives"
  ON public.objectives FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own objectives"
  ON public.objectives FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own objectives"
  ON public.objectives FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = owner_id);

CREATE POLICY "Users can delete their own objectives"
  ON public.objectives FOR DELETE
  USING (auth.uid() = created_by);

-- Key Results: Tương tự objectives
CREATE POLICY "Anyone can view key results"
  ON public.key_results FOR SELECT
  USING (true);

CREATE POLICY "Users can create key results for their objectives"
  ON public.key_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.objectives
      WHERE id = objective_id
      AND (created_by = auth.uid() OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can update key results"
  ON public.key_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.objectives
      WHERE id = objective_id
      AND (created_by = auth.uid() OR owner_id = auth.uid())
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY "Users can delete key results"
  ON public.key_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.objectives
      WHERE id = objective_id
      AND created_by = auth.uid()
    )
  );

-- Team Members: Mọi user có thể xem
CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 10. SAMPLE DATA (Optional - Xóa sau khi test)
-- ============================================
-- Uncomment để thêm data mẫu cho testing
/*
-- Tạo user mẫu (chỉ để test, thực tế sẽ tạo qua auth)
INSERT INTO public.profiles (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@okr.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user1@okr.com', 'User One', 'member'),
  ('00000000-0000-0000-0000-000000000003', 'user2@okr.com', 'User Two', 'member');

-- Tạo objectives mẫu
INSERT INTO public.objectives (title, description, owner_id, status, progress, due_date, created_by) VALUES
  ('Tăng trưởng doanh thu Q1', 'Mở rộng thị trường và tăng cường bán hàng', '00000000-0000-0000-0000-000000000001', 'on-track', 68, '2025-03-31', '00000000-0000-0000-0000-000000000001'),
  ('Cải thiện trải nghiệm KH', 'Nâng cao chất lượng dịch vụ', '00000000-0000-0000-0000-000000000002', 'at-risk', 45, '2025-03-31', '00000000-0000-0000-0000-000000000002');
*/

-- ============================================
-- HOÀN THÀNH!
-- ============================================
-- Sau khi chạy script này:
-- 1. Vào Table Editor để kiểm tra tables đã được tạo
-- 2. Vào Authentication > Policies để xem RLS policies
-- 3. Test bằng cách tạo user mới và thử CRUD operations
