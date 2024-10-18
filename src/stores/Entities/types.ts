import { ParsedPagedFetchAllResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { KeyedMutator } from 'swr';
import { AuthRoles } from 'types';

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
