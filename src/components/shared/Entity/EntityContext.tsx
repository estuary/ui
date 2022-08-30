import { createContext, useContext } from 'react';
import { BaseComponentProps, ENTITY_WITH_CREATE } from 'types';

interface Props extends BaseComponentProps {
    value: ENTITY_WITH_CREATE;
}

const EntityContext = createContext<ENTITY_WITH_CREATE | null>(null);

const EntityContextProvider = ({ children, value }: Props) => {
    return (
        <EntityContext.Provider value={value}>
            {children}
        </EntityContext.Provider>
    );
};

const useEntityType = () => {
    const context = useContext(EntityContext);

    if (context === null) {
        throw new Error(
            'useEntityType must be used within a EntityContextProvider'
        );
    }

    return context;
};

export { EntityContextProvider, useEntityType };
