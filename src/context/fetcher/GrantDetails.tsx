import { createContext, useContext } from 'react';

import { BaseComponentProps } from 'types';

import FullPageSpinner from 'components/fullPage/Spinner';

import { useQuery, useSelect } from 'hooks/supabase-swr';

import { TABLES } from 'services/supabase';

// TODO: Determine an approach that results in a single combined grants query of in the Authenticated app component.
export interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

const GrantDetailsContext = createContext<CombinedGrantsExtQuery[] | null>(
    null
);

const GrantDetailsContextProvider = ({ children }: BaseComponentProps) => {
    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants, isValidating } = useSelect(combinedGrantsQuery);

    const value = grants?.data ? grants.data : null;

    if (isValidating || value === null) {
        return <FullPageSpinner />;
    }

    return (
        <GrantDetailsContext.Provider value={value}>
            {children}
        </GrantDetailsContext.Provider>
    );
};

const useGrantDetails = () => {
    const context = useContext(GrantDetailsContext);

    if (context === null) {
        throw new Error(
            'useGrantDetails must be used within a GrantDetailsContextProvider'
        );
    }

    return context;
};

export { GrantDetailsContextProvider, useGrantDetails };
