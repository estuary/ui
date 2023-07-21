import { createContext } from 'react';

import { SupabaseClient } from '@supabase/supabase-js';

const Context = createContext<SupabaseClient | null>(null);

export default Context;
