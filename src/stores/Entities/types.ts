import { KeyedMutator } from 'swr';
import { AuthRoles, Schema } from 'types';

import { PostgrestResponse } from '@supabase/postgrest-js';

import { StoreWithHydration } from 'stores/extensions/Hydration';

interface ObjectRoleMetadata {
    [key: string]: {
        token?: string;
    };
}

export interface EntitiesState extends StoreWithHydration {
    // Storing what the user has access to
    capabilities: {
        admin: ObjectRoleMetadata | Schema | {};
        read: ObjectRoleMetadata | Schema | {};
        write: ObjectRoleMetadata | Schema | {};
    };
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    hydrateState: () => Promise<PostgrestResponse<AuthRoles>>;
    resetState: () => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;

    mutate: KeyedMutator<PostgrestResponse<AuthRoles>> | null;
    setMutate: (value: EntitiesState['mutate']) => void;
}
