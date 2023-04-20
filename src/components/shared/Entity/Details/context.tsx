import { authenticatedRoutes } from 'app/routes';
import { createContext, useContext } from 'react';
import { BaseComponentProps } from 'types';

export type Pages = keyof typeof authenticatedRoutes.captures.details;

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
