import type { KeyedMutator } from 'swr';

import type { ParsedPagedFetchAllResponse } from 'src/services/supabase';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { AuthRoles } from 'src/types';

export interface EntitiesState extends StoreWithHydration {
    // Storing what the user has access to
    capabilities: {
        admin: string[];
        read: string[];
        write: string[];
    };
    setCapabilities: (capabilities: (AuthRoles | null)[] | null) => void;

    hydrateState: () => Promise<ParsedPagedFetchAllResponse<AuthRoles>>;
    resetState: () => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;

    mutate: KeyedMutator<ParsedPagedFetchAllResponse<AuthRoles>> | null;
    setMutate: (value: EntitiesState['mutate']) => void;
}
