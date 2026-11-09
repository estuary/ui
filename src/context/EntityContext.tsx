import type { BaseComponentProps, Entity } from 'src/types';

import { createContext, useContext, useMemo } from 'react';

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

// This is for WORKFLOWS only. This means "collections" = "transformations"
const useEntityTypeTranslatedForWorkflows = () => {
    const entityTypeValue = useEntityType();

    return useMemo(() => {
        switch (entityTypeValue) {
            case 'capture':
                return 'Capture';
                break;
            case 'materialization':
                return 'Materialization';
                break;
            case 'collection':
                return 'Transformation';
                break;
            default:
                return 'Entity';
                break;
        }
    }, [entityTypeValue]);
};

export {
    EntityContextProvider,
    useEntityType,
    useEntityTypeTranslatedForWorkflows,
};
