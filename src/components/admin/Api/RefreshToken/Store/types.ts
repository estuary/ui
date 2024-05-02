import { PostgrestError } from '@supabase/postgrest-js';

export interface RefreshTokenState {
    token: string;
    setToken: (value: string) => void;

    description: string;
    updateDescription: (value: string) => void;

    saving: boolean;
    setSaving: (value: boolean) => void;

    serverError: PostgrestError | null;
    setServerError: (value: PostgrestError | string | null) => void;

    resetState: () => void;
}
