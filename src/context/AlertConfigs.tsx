import type { AlertConfigQueryResponse } from 'src/api/types';
import type { BaseComponentProps } from 'src/types';
import type { AlertConfigQueryInput } from 'src/types/gql';
import type { UseQueryResponse } from 'urql';

import { createContext, useContext } from 'react';

import { useQuery } from 'urql';

import { AlertConfigQuery } from 'src/api/alerts';
import { useTenantStore } from 'src/stores/Tenant';

const AlertConfigsContext = createContext<UseQueryResponse<
    AlertConfigQueryResponse,
    AlertConfigQueryInput
> | null>(null);

export const AlertConfigsProvider = ({ children }: BaseComponentProps) => {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const response = useQuery({
        pause: selectedTenant.length === 0,
        query: AlertConfigQuery,
    });

    return (
        <AlertConfigsContext.Provider value={response}>
            {children}
        </AlertConfigsContext.Provider>
    );
};

export const useGetAlertConfigs = () => {
    const context = useContext(AlertConfigsContext);

    if (context === null) {
        throw new Error(
            'useGetAlertConfigs must be used within a AlertConfigsProvider'
        );
    }

    return context;
};
