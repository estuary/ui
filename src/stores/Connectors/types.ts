import { ConnectorTag } from 'hooks/connectors/shared';
import { ParsedPagedFetchAllResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { KeyedMutator } from 'swr';
import { AuthRoles } from 'types';

export interface Connectors {
    [key: string]: {
        token?: ConnectorTag;
    };
}

export interface ConnectorsState extends StoreWithHydration {
    // Storing what the user has access to
    connectors: any; //Connectors
    setConnectors: (val: any) => void;

    hydrateState: () => Promise<ParsedPagedFetchAllResponse<any>>;
    resetState: () => void;

    hydrationErrors: any;
    setHydrationErrors: (val: ConnectorsState['hydrationErrors']) => void;

    mutate: KeyedMutator<ParsedPagedFetchAllResponse<AuthRoles>> | null;
    setMutate: (value: ConnectorsState['mutate']) => void;
}