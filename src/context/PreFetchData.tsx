import { useQuery, useSelect } from 'hooks/supabase-swr';
import { createContext, useContext } from 'react';
import { TABLES } from 'services/supabase';
import { BaseComponentProps } from 'types';

// TODO: Determine an approach that results in a single combined grants query of in the Authenticated app component.
export interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

interface PreFetchData {
    grantDetails: CombinedGrantsExtQuery[];
}

const PreFetchDataContext = createContext<PreFetchData | null>(null);

const PreFetchDataProvider = ({ children }: BaseComponentProps) => {
    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const value: PreFetchData | null = grants?.data
        ? { grantDetails: grants.data }
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
