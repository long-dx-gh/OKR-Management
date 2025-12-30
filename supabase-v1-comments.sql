-- ============================================
-- OKR PLATFORM V1: COMMENTS & COLLABORATION
-- ============================================
-- Run this AFTER the base schema (supabase-schema.sql)
-- This adds commenting and collaboration features

-- ============================================
-- 1. COMMENTS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE,
  key_result_id UUID REFERENCES public.key_results(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For threaded replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure comment is on either objective OR key result, not both
  CONSTRAINT comment_target CHECK (
    (objective_id IS NOT NULL AND key_result_id IS NULL) OR
    (objective_id IS NULL AND key_result_id IS NOT NULL)
  )
);

-- ============================================
-- 2. COMMENT REACTIONS (Optional but nice)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL, -- '👍', '❤️', '🎉', '👏'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User can only react once per emoji per comment
  UNIQUE(comment_id, user_id, emoji)
);

-- ============================================
-- 3. ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'commented', 'completed'
  entity_type TEXT NOT NULL, -- 'objective', 'key_result', 'comment'
  entity_id UUID NOT NULL,
  entity_title TEXT, -- For display purposes
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_comments_objective ON public.comments(objective_id) WHERE objective_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_key_result ON public.comments(key_result_id) WHERE key_result_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Comments: Anyone can view, authenticated users can create
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions: Anyone can view, authenticated users can manage their own
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.comment_reactions;
CREATE POLICY "Anyone can view reactions"
  ON public.comment_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can add reactions" ON public.comment_reactions;
CREATE POLICY "Users can add reactions"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their reactions" ON public.comment_reactions;
CREATE POLICY "Users can remove their reactions"
  ON public.comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Activities: Anyone can view
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activities;
CREATE POLICY "Anyone can view activities"
  ON public.activities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "System can insert activities" ON public.activities;
CREATE POLICY "System can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 6. TRIGGERS for Auto-updating timestamps
-- ============================================
CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. FUNCTION: Log Activity
-- ============================================
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log different types of activities
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (user_id, action, entity_type, entity_id, entity_title)
    VALUES (
      NEW.created_by,
      'created',
      TG_TABLE_NAME,
      NEW.id,
      NEW.title
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.progress != NEW.progress THEN
    INSERT INTO public.activities (user_id, action, entity_type, entity_id, entity_title, metadata)
    VALUES (
      auth.uid(),
      'updated',
      TG_TABLE_NAME,
      NEW.id,
      NEW.title,
      jsonb_build_object('old_progress', OLD.progress, 'new_progress', NEW.progress)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to log activities
DROP TRIGGER IF EXISTS log_objective_activity ON public.objectives;
CREATE TRIGGER log_objective_activity
  AFTER INSERT OR UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

-- ============================================
-- 8. FUNCTION: Log Comment Activity
-- ============================================
CREATE OR REPLACE FUNCTION public.log_comment_activity()
RETURNS TRIGGER AS $$
DECLARE
  entity_title TEXT;
  entity_type TEXT;
  entity_id UUID;
BEGIN
  -- Determine what was commented on
  IF NEW.objective_id IS NOT NULL THEN
    SELECT title INTO entity_title FROM public.objectives WHERE id = NEW.objective_id;
    entity_type := 'objective';
    entity_id := NEW.objective_id;
  ELSE
    SELECT title INTO entity_title FROM public.key_results WHERE id = NEW.key_result_id;
    entity_type := 'key_result';
    entity_id := NEW.key_result_id;
  END IF;
  
  -- Log the comment activity
  INSERT INTO public.activities (user_id, action, entity_type, entity_id, entity_title, metadata)
  VALUES (
    NEW.user_id,
    'commented',
    entity_type,
    entity_id,
    entity_title,
    jsonb_build_object('comment_id', NEW.id, 'comment_preview', LEFT(NEW.content, 50))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_comment ON public.comments;
CREATE TRIGGER log_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_comment_activity();

-- ============================================
-- 9. ENABLE REALTIME for Comments
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:

-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('comments', 'comment_reactions', 'activities');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('comments', 'comment_reactions', 'activities');

-- Check policies
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('comments', 'comment_reactions', 'activities');

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
-- Uncomment to add sample comments (requires existing objectives)

/*
-- Sample comment on first objective
INSERT INTO public.comments (objective_id, user_id, content)
SELECT 
  id, 
  created_by,
  'Great progress on this objective! Keep it up! 🎉'
FROM public.objectives
LIMIT 1;
*/

-- ============================================
-- COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify tables created
-- 3. Test commenting in the app
