-- ============================================
-- V1 Feature #2: Analytics & Insights Dashboard
-- Database Views and Functions
-- ============================================

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View: Overall OKR Statistics
CREATE OR REPLACE VIEW okr_statistics AS
SELECT 
  COUNT(DISTINCT o.id) as total_objectives,
  COUNT(DISTINCT kr.id) as total_key_results,
  COUNT(DISTINCT o.owner_id) as active_users,
  ROUND(AVG(o.progress)::numeric, 2) as avg_progress,
  COUNT(DISTINCT CASE WHEN o.status = 'on-track' THEN o.id END) as on_track_count,
  COUNT(DISTINCT CASE WHEN o.status = 'at-risk' THEN o.id END) as at_risk_count,
  COUNT(DISTINCT CASE WHEN o.status = 'off-track' THEN o.id END) as off_track_count,
  COUNT(DISTINCT CASE WHEN o.progress >= 100 THEN o.id END) as completed_count,
  COUNT(DISTINCT CASE WHEN o.due_date < NOW() AND o.progress < 100 THEN o.id END) as overdue_count
FROM objectives o
LEFT JOIN key_results kr ON kr.objective_id = o.id;

-- View: Progress Over Time (Last 30 days)
CREATE OR REPLACE VIEW progress_over_time AS
SELECT 
  DATE(a.created_at) as date,
  COUNT(DISTINCT a.entity_id) as objectives_updated,
  ROUND(AVG(CASE 
    WHEN a.metadata->>'progress' IS NOT NULL 
    THEN (a.metadata->>'progress')::numeric 
    ELSE 0 
  END)::numeric, 2) as avg_progress
FROM activities a
WHERE 
  a.entity_type = 'objective'
  AND a.action = 'updated'
  AND a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(a.created_at)
ORDER BY date DESC;

-- View: Team Performance
CREATE OR REPLACE VIEW team_performance AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  COUNT(DISTINCT o.id) as owned_objectives,
  ROUND(AVG(o.progress)::numeric, 2) as avg_progress,
  COUNT(DISTINCT CASE WHEN o.status = 'on-track' THEN o.id END) as on_track,
  COUNT(DISTINCT CASE WHEN o.status = 'at-risk' THEN o.id END) as at_risk,
  COUNT(DISTINCT CASE WHEN o.status = 'off-track' THEN o.id END) as off_track,
  COUNT(DISTINCT kr.id) as owned_key_results,
  COUNT(DISTINCT c.id) as total_comments,
  COUNT(DISTINCT a.id) as total_activities
FROM profiles p
LEFT JOIN objectives o ON o.owner_id = p.id
LEFT JOIN key_results kr ON kr.owner_id = p.id
LEFT JOIN comments c ON c.user_id = p.id
LEFT JOIN activities a ON a.user_id = p.id
GROUP BY p.id, p.full_name, p.email
ORDER BY avg_progress DESC NULLS LAST;

-- View: Status Distribution by Week
CREATE OR REPLACE VIEW status_distribution AS
SELECT 
  DATE_TRUNC('week', o.created_at) as week,
  o.status,
  COUNT(*) as count
FROM objectives o
WHERE o.created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', o.created_at), o.status
ORDER BY week DESC, status;

-- View: Completion Rate by Month
CREATE OR REPLACE VIEW completion_rate AS
SELECT 
  DATE_TRUNC('month', o.created_at) as month,
  COUNT(*) as total_objectives,
  COUNT(CASE WHEN o.progress >= 100 THEN 1 END) as completed_objectives,
  ROUND((COUNT(CASE WHEN o.progress >= 100 THEN 1 END)::numeric / 
         NULLIF(COUNT(*), 0)::numeric * 100), 2) as completion_percentage
FROM objectives o
WHERE o.created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Function: Get progress trend for specific objective
CREATE OR REPLACE FUNCTION get_objective_progress_trend(objective_uuid UUID)
RETURNS TABLE (
  date DATE,
  progress NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(a.created_at) as date,
    (a.metadata->>'progress')::numeric as progress
  FROM activities a
  WHERE 
    a.entity_type = 'objective'
    AND a.entity_id = objective_uuid
    AND a.action = 'updated'
    AND a.metadata->>'progress' IS NOT NULL
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get team velocity (objectives completed per week)
CREATE OR REPLACE FUNCTION get_team_velocity(weeks INTEGER DEFAULT 12)
RETURNS TABLE (
  week DATE,
  completed_count INTEGER,
  created_count INTEGER,
  velocity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_data AS (
    SELECT 
      DATE_TRUNC('week', o.created_at)::date as week,
      COUNT(CASE WHEN o.progress >= 100 THEN 1 END) as completed,
      COUNT(*) as created
    FROM objectives o
    WHERE o.created_at >= NOW() - (weeks || ' weeks')::interval
    GROUP BY DATE_TRUNC('week', o.created_at)
  )
  SELECT 
    w.week,
    w.completed::integer,
    w.created::integer,
    ROUND((w.completed::numeric / NULLIF(w.created, 0)::numeric * 100), 2) as velocity_score
  FROM weekly_data w
  ORDER BY w.week DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get engagement score for user
CREATE OR REPLACE FUNCTION get_user_engagement(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  engagement_score NUMERIC,
  activities_count INTEGER,
  comments_count INTEGER,
  objectives_created INTEGER,
  last_activity TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    ROUND((
      (COUNT(DISTINCT a.id)::numeric * 1.0) +
      (COUNT(DISTINCT c.id)::numeric * 2.0) +
      (COUNT(DISTINCT o.id)::numeric * 3.0)
    ), 2) as engagement_score,
    COUNT(DISTINCT a.id)::integer as activities_count,
    COUNT(DISTINCT c.id)::integer as comments_count,
    COUNT(DISTINCT o.id)::integer as objectives_created,
    MAX(GREATEST(
      COALESCE(a.created_at, '1970-01-01'),
      COALESCE(c.created_at, '1970-01-01'),
      COALESCE(o.created_at, '1970-01-01')
    )) as last_activity
  FROM profiles p
  LEFT JOIN activities a ON a.user_id = p.id
  LEFT JOIN comments c ON c.user_id = p.id
  LEFT JOIN objectives o ON o.created_by = p.id
  WHERE p.id = user_uuid
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get top performers (by progress)
CREATE OR REPLACE FUNCTION get_top_performers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  avg_progress NUMERIC,
  objectives_count INTEGER,
  on_track_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.email,
    ROUND(AVG(o.progress)::numeric, 2) as avg_progress,
    COUNT(DISTINCT o.id)::integer as objectives_count,
    COUNT(DISTINCT CASE WHEN o.status = 'on-track' THEN o.id END)::integer as on_track_count
  FROM profiles p
  INNER JOIN objectives o ON o.owner_id = p.id
  GROUP BY p.id, p.full_name, p.email
  HAVING COUNT(DISTINCT o.id) > 0
  ORDER BY avg_progress DESC, objectives_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON okr_statistics TO authenticated;
GRANT SELECT ON progress_over_time TO authenticated;
GRANT SELECT ON team_performance TO authenticated;
GRANT SELECT ON status_distribution TO authenticated;
GRANT SELECT ON completion_rate TO authenticated;

-- Grant EXECUTE on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_objective_progress_trend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_velocity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_performers(INTEGER) TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW okr_statistics IS 'Overall OKR statistics and metrics';
COMMENT ON VIEW progress_over_time IS 'Progress tracking over last 30 days';
COMMENT ON VIEW team_performance IS 'Individual team member performance metrics';
COMMENT ON VIEW status_distribution IS 'Status distribution by week';
COMMENT ON VIEW completion_rate IS 'Monthly completion rate';

COMMENT ON FUNCTION get_objective_progress_trend IS 'Get progress history for specific objective';
COMMENT ON FUNCTION get_team_velocity IS 'Calculate team velocity (completion rate per week)';
COMMENT ON FUNCTION get_user_engagement IS 'Calculate engagement score for user';
COMMENT ON FUNCTION get_top_performers IS 'Get top performing team members';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ V1 Feature #2: Analytics schema deployed successfully!';
  RAISE NOTICE '📊 Created 5 views: okr_statistics, progress_over_time, team_performance, status_distribution, completion_rate';
  RAISE NOTICE '🔧 Created 4 functions: get_objective_progress_trend, get_team_velocity, get_user_engagement, get_top_performers';
  RAISE NOTICE '🔒 Permissions granted to authenticated users';
END $$;
