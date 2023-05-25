import { PostgrestResponse } from '@supabase/postgrest-js';
import { StoreWithHydration } from 'stores/Hydration';
import { AuthRoles, Schema } from 'types';

interface Capability {
    [key: string]: {
        token?: string;
    };
}

export interface EntitiesState extends StoreWithHydration {
    // Storing what the user has access to
    capabilities: {
        admin: Capability | Schema | {};
        read: Capability | Schema | {};
        write: Capability | Schema | {};
    };
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    hydrateState: () => Promise<PostgrestResponse<AuthRoles>>;
    resetState: () => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;
}
