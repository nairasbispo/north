import { createClient } from '@supabase/supabase-js';

// Get client-side config variables from Vite environment safely
const metaEnv = (import.meta as any).env || {};

const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Only initialize if configured, to prevent console errors on start
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Define user interface that matches Firebase user so the rest of the application remains unchanged
export interface SupabaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

// Convert Supabase User to our standard User format
export function mapSupabaseUser(user: any): SupabaseUser | null {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário Supabase',
    photoURL: user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_fvfjYbviNKIfXWmXQ-eOVIEvOTeM9mhbY3f8qjao2Z-ZVxURhd14mIdFQJDXMyhk-XrkDXCEFIZnqiLqJ4WhETgr7WrZq6uHCgatQA0eX0jhdHbt0xw9rqvFjVkm-2Z8mTmfFyECmdSTIpBi-xIO7LeMlKI2CKKM5pqJ7ud442YAkcTuP-oxZKzAsRTIibZFuBoCA-LjmiFTx7ui29QUw4QVlQbWQx4tfLof3nIeLVNdg2dtTIs7whEZcG7OSNs-DEmw3Gns0JcJ"
  };
}

// SQL Schema code for copy-pasting into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- 1. Habilitar a extensão UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Hábitos (habits)
CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Treinos (exercise_logs)
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    intensity TEXT NOT NULL,
    notes TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Idiomas (language_logs)
CREATE TABLE IF NOT EXISTS public.language_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    language TEXT NOT NULL,
    hours DOUBLE PRECISION NOT NULL,
    date TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de Status Gerais (user_stats)
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY,
    streak INTEGER DEFAULT 12,
    water_amount DOUBLE PRECISION DEFAULT 1.2,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabela de Configurações de Rotina (routine_settings)
CREATE TABLE IF NOT EXISTS public.routine_settings (
    user_id UUID PRIMARY KEY,
    wake_time TEXT DEFAULT '06:30',
    sleep_time TEXT DEFAULT '22:30',
    weekly_exercise_goal INTEGER DEFAULT 4,
    monthly_language_goal INTEGER DEFAULT 20,
    push_notifications BOOLEAN DEFAULT TRUE,
    dark_theme BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Configurar as políticas de RLS (Row Level Security) para segurança completa!
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_settings ENABLE ROW LEVEL SECURITY;

-- Exemplo de políticas de segurança (permite que usuários editem apenas seus próprios dados):

CREATE POLICY "Usuários podem acessar seus próprios hábitos" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem acessar seus próprios treinos" ON public.exercise_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem acessar seus próprios registros de idioma" ON public.language_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem acessar seus próprios status" ON public.user_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem acessar suas próprias configurações" ON public.routine_settings
    FOR ALL USING (auth.uid() = user_id);
`;
