import { PostgrestResponse } from '@supabase/postgrest-js';
import { AuthRoles, Schema } from 'types';

interface Capability {
    [key: string]: {
        token?: string;
    };
}

export interface EntitiesState {
    // Storing what the user has access to
    capabilities: {
        admin: Capability | Schema | {};
        read: Capability | Schema | {};
        write: Capability | Schema | {};
    };
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    hydrateState: () => Promise<PostgrestResponse<AuthRoles>>;
    hydrated: boolean;
    setHydrated: (val: EntitiesState['hydrated']) => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;

    resetState: () => void;
}
