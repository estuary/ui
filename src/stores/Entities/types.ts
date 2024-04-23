import { ParsedPagedFetchAllResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { KeyedMutator } from 'swr';
import { AuthRoles, Schema } from 'types';

export interface ObjectRoleMetadata {
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
    setCapabilities: (capabilities: (AuthRoles | null)[] | null) => void;

    hydrateState: () => Promise<ParsedPagedFetchAllResponse<AuthRoles>>;
    resetState: () => void;

    hydrationErrors: any;
    setHydrationErrors: (val: EntitiesState['hydrationErrors']) => void;

    mutate: KeyedMutator<ParsedPagedFetchAllResponse<AuthRoles>> | null;
    setMutate: (value: EntitiesState['mutate']) => void;
}
