import type { BaseComponentProps } from 'src/types';
import type { AlertTypeQueryResponse } from 'src/types/gql';
import type { UseQueryResponse } from 'urql';

import { createContext, useContext, useMemo } from 'react';

import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';

const AlertTypeContext =
    createContext<UseQueryResponse<AlertTypeQueryResponse> | null>(null);

export const AlertTypeProvider = ({ children }: BaseComponentProps) => {
    const response = useQuery({ query: AlertTypeQuery });
    const [resp, reexecute] = response;

    // filter out the free_trial_stalled alert type since it is not used in the UI
    // TODO: remove this filter once the free_trial_stalled alert type is removed from the backend
    const newResponse = useMemo<typeof response>(() => {
        if (!resp.data) return [resp, reexecute];
        const alertTypes = resp.data.alertTypes.filter(
            (v) => v.alertType !== 'free_trial_stalled'
        );
        return [{ ...resp, data: { ...resp.data, alertTypes } }, reexecute];
    }, [resp, reexecute]);

    return (
        <AlertTypeContext.Provider value={newResponse}>
            {children}
        </AlertTypeContext.Provider>
    );
};

export const useGetAlertTypes = () => {
    const context = useContext(AlertTypeContext);

    if (context === null) {
        throw new Error(
            'useGetAlertTypes must be used within a AlertTypeProvider'
        );
    }

    return context;
};
