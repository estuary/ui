import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { isEmpty } from 'lodash';
import { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';
import { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

// TODO: Determine an approach that results in a single combined grants query of in the Authenticated app component.
export interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

interface PreFetchData {
    grantDetails: CombinedGrantsExtQuery[];
}

const CONNECTOR_VERSION = ':v1';
const PreFetchDataContext = createContext<PreFetchData | null>(null);

const PreFetchDataProvider = ({ children }: BaseComponentProps) => {
    // TODO (context) create a local storage context provider
    useLocalStorage(LocalStorageKeys.CONNECTOR_TAG_SELECTOR, CONNECTOR_VERSION);

    const { combinedGrants: grants } = useCombinedGrantsExt({});

    const value: PreFetchData | null = !isEmpty(grants)
        ? { grantDetails: grants }
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
