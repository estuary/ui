import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import FullPageError from 'components/fullPage/Error';
import { supabaseClient } from 'context/Supabase';
import { createContext, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';
import { BaseComponentProps } from 'types';

// TODO: Determine an approach that results in a single combined grants query of in the Authenticated app component.
export interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

const GrantDetailsContext = createContext<CombinedGrantsExtQuery[] | null>(
    null
);

const GrantDetailsContextProvider = ({ children }: BaseComponentProps) => {
    const {
        data: grants,
        isValidating,
        error,
    } = useQuery(
        supabaseClient
            .from(TABLES.COMBINED_GRANTS_EXT)
            .select(`id, object_role`)
    );

    if (error) {
        return (
            <FullPageError
                error={error}
                message={<FormattedMessage id="fetcher.grants.error.message" />}
            />
        );
    }

    if (isValidating || !grants) {
        return null;
    }

    return (
        <GrantDetailsContext.Provider value={grants}>
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
