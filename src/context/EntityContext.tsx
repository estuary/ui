import { createContext, useContext, useMemo } from 'react';

import { useIntl } from 'react-intl';

import { BaseComponentProps, Entity } from 'src/types';

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
    const intl = useIntl();

    const entityTypeValue = useEntityType();

    return useMemo(() => {
        switch (entityTypeValue) {
            case 'capture':
                return intl.formatMessage({ id: 'terms.capture' });
                break;
            case 'materialization':
                return intl.formatMessage({ id: 'terms.materialization' });
                break;
            case 'collection':
                return intl.formatMessage({ id: 'terms.transformation' });
                break;
            default:
                return intl.formatMessage({ id: 'terms.entity' });
                break;
        }
    }, [entityTypeValue, intl]);
};

export {
    EntityContextProvider,
    useEntityType,
    useEntityTypeTranslatedForWorkflows,
};
