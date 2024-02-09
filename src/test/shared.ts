import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const mockClient = createClient(SUPABASE_URL, 'MockSupabaseAnonKey');
