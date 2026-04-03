import type { BaseComponentProps } from 'src/types';
import type { AlertTypeQueryResponse } from 'src/types/gql';
import type { UseQueryResponse } from 'urql';

import { createContext, useContext } from 'react';

import { useQuery } from 'urql';

import { AlertTypeQuery } from 'src/api/alerts';

const AlertTypeContext =
    createContext<UseQueryResponse<AlertTypeQueryResponse> | null>(null);

export const AlertTypeProvider = ({ children }: BaseComponentProps) => {
    const response = useQuery({ query: AlertTypeQuery });

    return (
        <AlertTypeContext.Provider value={response}>
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
