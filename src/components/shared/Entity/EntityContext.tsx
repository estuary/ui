import { createContext, useContext } from 'react';
import { BaseComponentProps, ENTITY } from 'types';

interface Props extends BaseComponentProps {
    value: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

const EntityContext = createContext<
    ENTITY.CAPTURE | ENTITY.MATERIALIZATION | null
>(null);

const EntityContextProvider = ({ children, value }: Props) => {
    return (
        <EntityContext.Provider value={value}>
            {children}
        </EntityContext.Provider>
    );
};

const useEntityContext = () => {
    const context = useContext(EntityContext);

    if (context === null) {
        throw new Error(
            'useEntityContext must be used within a EntityContextProvider'
        );
    }

    return context;
};

export { EntityContextProvider, useEntityContext };
