import { BaseComponentProps, Entity } from 'types';

import { createContext, useContext } from 'react';

interface Props extends BaseComponentProps {
    value: Entity;
}

const EntityContext = createContext<Entity | null>(null);

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
