import type { ReducedAlertSubscriptionQueryResponse } from 'src/api/types';
import type { BaseComponentProps } from 'src/types';
import type { UseQueryResponse } from 'urql';

import { createContext, useContext } from 'react';

import { useQuery } from 'urql';

import { AlertSubscriptionQuery } from 'src/api/alerts';
import { useTenantStore } from 'src/stores/Tenant/Store';

const AlertSubscriptionsContext = createContext<UseQueryResponse<
    ReducedAlertSubscriptionQueryResponse,
    { prefix: string }
> | null>(null);

export const AlertSubscriptionsProvider = ({
    children,
}: BaseComponentProps) => {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const response = useQuery({
        query: AlertSubscriptionQuery,
        variables: { prefix: selectedTenant },
        pause: !selectedTenant,
    });

    return (
        <AlertSubscriptionsContext.Provider value={response}>
            {children}
        </AlertSubscriptionsContext.Provider>
    );
};

export const useGetAlertSubscriptions = () => {
    const context = useContext(AlertSubscriptionsContext);

    if (context === null) {
        throw new Error(
            'useGetAlertSubscriptions must be used within a AlertSubscriptionsProvider'
        );
    }

    return context;
};
