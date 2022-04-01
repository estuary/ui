import { createClient } from '@supabase/supabase-js'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!
/* eslint-enable */

export const supaClient = createClient(supabaseUrl, supabaseAnonKey)