import { getAuthRoles } from 'api/combinedGrantsExt';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { createContext, useContext, useState } from 'react';
import { useEffectOnce } from 'react-use';
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
    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );

    const [authRoles, setAuthRoles] = useState<any | null>(null);
    useEffectOnce(() => {
        getAuthRoles('read')
            .then((response) => {
                setAuthRoles(response);
            })
            .catch((error) => {
                setAuthRoles(error);
            });
    });

    const { data: grants, isValidating } = useSelect(combinedGrantsQuery);

    const value = grants?.data ? grants.data : null;

    console.log('authRoles and grants', {
        authRoles,
        grants,
    });

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
