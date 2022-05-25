import { Auth } from '@supabase/ui';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { createContext, useContext } from 'react';
import { TABLES } from 'services/supabase';
import { BaseComponentProps } from 'types';

// TODO: Determine if this approach is worth keeping around. The logic in this file is a WIP.

export interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

interface PreFetchData {
    sessionKey: string;
    grantDetails: CombinedGrantsExtQuery[];
}

const PreFetchDataContext = createContext<PreFetchData | null>(null);

const PreFetchDataProvider = ({ children }: BaseComponentProps) => {
    const { session } = Auth.useUser();

    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const value: PreFetchData | null =
        session?.access_token && grants?.data
            ? { sessionKey: session.access_token, grantDetails: grants.data }
            : null;

    return (
        <PreFetchDataContext.Provider value={value}>
            {children}
        </PreFetchDataContext.Provider>
    );
};

const usePreFetchData = () => {
    const context = useContext(PreFetchDataContext);

    if (context === null) {
        throw new Error(
            'usePreFetchData must be used within a PreFetchDataProvider'
        );
    }

    return context;
};

export { PreFetchDataProvider, usePreFetchData };
