-- ============================================================================
-- StudioOS production Supabase PostgreSQL Database Schema
-- Architecture V2: Clean Reset & UUID Architecture
-- ============================================================================

-- 0. CLEAN RESET (Drop Everything in Dependency Order)
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.handoffs CASCADE;
DROP TABLE IF EXISTS public.quality_gates CASCADE;
DROP TABLE IF EXISTS public.deliverables CASCADE;
DROP TABLE IF EXISTS public.workflows CASCADE;
DROP TABLE IF EXISTS public.team_roles CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.strategic_pillars CASCADE;
DROP TABLE IF EXISTS public.strategies CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;


-- ============================================================================
-- 1. BASE CONFIGURATION & TRIGGERS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER PROFILES TABLE
CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    display_name text,
    avatar_url text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own profile" 
    ON public.user_profiles FOR ALL 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- TRIGGER: Automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================================
-- 2. CORE DOMAIN: PROJECTS & ACTIVITY
-- ============================================================================
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL,
    target_audience text NOT NULL,
    status text DEFAULT 'active' NOT NULL,
    ai_model text,
    ai_provider text,
    ai_generation_time text,
    ai_duration_ms integer,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own projects" 
    ON public.projects FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOG TABLE
CREATE TABLE public.activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_activity_user_id ON public.activity_log(user_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and create their own activity logs"
    ON public.activity_log FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI CONVERSATIONS TABLE
CREATE TABLE public.ai_conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role text NOT NULL, -- 'user' or 'assistant'
    message text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_ai_conv_project_id ON public.ai_conversations(project_id);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage conversations based on project ownership"
    ON public.ai_conversations FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));


-- ============================================================================
-- 3. NESTED PROJECT DOMAINS
-- ============================================================================

-- STRATEGIES TABLE
CREATE TABLE public.strategies (
    project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    vision text NOT NULL,
    mission text NOT NULL,
    unique_value_prop text NOT NULL,
    axis_x text,
    axis_y text,
    notes text
);

ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage strategies based on project ownership"
    ON public.strategies FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- STRATEGIC PILLARS TABLE
CREATE TABLE public.strategic_pillars (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    explanation text NOT NULL,
    order_index integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_pillars_project_id ON public.strategic_pillars(project_id);

ALTER TABLE public.strategic_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage strategic_pillars based on project ownership"
    ON public.strategic_pillars FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- TEAMS TABLE
CREATE TABLE public.teams (
    project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    team_name text NOT NULL,
    workflow_rule text,
    synergy_notes text
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage teams based on project ownership"
    ON public.teams FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- TEAM ROLES TABLE
CREATE TABLE public.team_roles (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    count integer NOT NULL DEFAULT 1,
    vibe text,
    responsibilities text[] DEFAULT '{}'::text[],
    tools text[] DEFAULT '{}'::text[],
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_team_roles_project_id ON public.team_roles(project_id);

ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage team_roles based on project ownership"
    ON public.team_roles FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- WORKFLOWS TABLE
CREATE TABLE public.workflows (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_name text NOT NULL,
    description text NOT NULL,
    input text,
    process text,
    output text,
    timeline_estimate text,
    order_index integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_workflows_project_id ON public.workflows(project_id);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage workflows based on project ownership"
    ON public.workflows FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- DELIVERABLES TABLE
CREATE TABLE public.deliverables (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    format text,
    assignee text,
    description text NOT NULL,
    steps text[] DEFAULT '{}'::text[],
    order_index integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_deliverables_project_id ON public.deliverables(project_id);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage deliverables based on project ownership"
    ON public.deliverables FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- QUALITY GATES TABLE
CREATE TABLE public.quality_gates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase text NOT NULL,
    criteria text[] DEFAULT '{}'::text[],
    gatekeepers text[] DEFAULT '{}'::text[],
    remediation_path text,
    order_index integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_quality_gates_project_id ON public.quality_gates(project_id);

ALTER TABLE public.quality_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage quality_gates based on project ownership"
    ON public.quality_gates FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- HANDOFFS TABLE
CREATE TABLE public.handoffs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    task_name text NOT NULL,
    target_ai text NOT NULL,
    context_required text[] DEFAULT '{}'::text[],
    prompt_template text NOT NULL,
    expected_output_format text NOT NULL,
    instructions text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_handoffs_project_id ON public.handoffs(project_id);

ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage handoffs based on project ownership"
    ON public.handoffs FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- RISKS TABLE
CREATE TABLE public.risks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    category text NOT NULL,
    description text NOT NULL,
    likelihood text NOT NULL,
    impact text NOT NULL,
    mitigation text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id, project_id)
);

CREATE INDEX idx_risks_project_id ON public.risks(project_id);

ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage risks based on project ownership"
    ON public.risks FOR ALL
    USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
