import { createContext, useContext } from 'react';

import type { authenticatedRoutes } from 'src/app/routes';
import type { BaseComponentProps } from 'src/types';

export type Pages =
    | keyof typeof authenticatedRoutes.captures.details
    | keyof typeof authenticatedRoutes.collections.details
    | keyof typeof authenticatedRoutes.materializations.details;

interface Props extends BaseComponentProps {
    value: Pages;
}

const DetailsPageContext = createContext<Pages | null>(null);

const DetailsPageContextProvider = ({ children, value }: Props) => {
    return (
        <DetailsPageContext.Provider value={value}>
            {children}
        </DetailsPageContext.Provider>
    );
};

const useDetailsPage = () => {
    const context = useContext(DetailsPageContext);

    if (context === null) {
        throw new Error(
            'useDetailsPageType must be used within a DetailsPageContextProvider'
        );
    }

    return context;
};

export { DetailsPageContextProvider, useDetailsPage };
