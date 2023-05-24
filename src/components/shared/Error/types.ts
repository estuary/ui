import { PostgrestError } from '@supabase/postgrest-js';

export type ErrorDetails = PostgrestError | any | null;
