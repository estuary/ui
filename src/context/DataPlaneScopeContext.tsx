import { createContext, useCallback, useContext, useState } from 'react';
import { DataPlaneScopes } from 'stores/DetailsForm/types';
import { BaseComponentProps } from 'types';

interface DataPlaneScope {
    dataPlaneScope: DataPlaneScopes;
    toggleScope: Function;
}

const DataPlaneScopeContext = createContext<DataPlaneScope | null>(null);

const DataPlaneScopeContextProvider = ({ children }: BaseComponentProps) => {
    const [dataPlaneScope, setDataPlaneScope] =
        useState<DataPlaneScopes>('private');

    const toggleScope = useCallback(() => {
        setDataPlaneScope(dataPlaneScope === 'public' ? 'private' : 'public');
    }, [dataPlaneScope]);

    return (
        <DataPlaneScopeContext.Provider value={{ dataPlaneScope, toggleScope }}>
            {children}
        </DataPlaneScopeContext.Provider>
    );
};

const useDataPlaneScope = () => {
    const context = useContext(DataPlaneScopeContext);

    if (context === null) {
        throw new Error(
            'useDataPlaneScope must be used within a DataPlaneScopeContextProvider'
        );
    }

    return context;
};

export { DataPlaneScopeContextProvider, useDataPlaneScope };
