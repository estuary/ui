import { SupabaseClient } from '@supabase/supabase-js';
import { createContext } from 'react';

const Context = createContext<SupabaseClient | null>(null);

export default Context;
