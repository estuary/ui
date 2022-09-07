import { createContext, useContext } from 'react';
import { BaseComponentProps, EntityWithCreateWorkflow } from 'types';

interface Props extends BaseComponentProps {
    value: EntityWithCreateWorkflow;
}

const EntityContext = createContext<EntityWithCreateWorkflow | null>(null);

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
