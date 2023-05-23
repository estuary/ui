import { PostgrestResponse } from '@supabase/postgrest-js';
import { AuthRoles, Schema } from 'types';

interface PrefixProps {
    [key: string]: {
        token?: string;
    };
}

export interface EntitiesState {
    // Storing what the user has access to
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    prefixes: {
        admin: PrefixProps | Schema | {};
        read: PrefixProps | Schema | {};
        write: PrefixProps | Schema | {};
    };

    hydrateState: () => Promise<PostgrestResponse<AuthRoles>>;
    hydrated: boolean;
    setHydrated: (val: EntitiesState['hydrated']) => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;

    resetState: () => void;
}
