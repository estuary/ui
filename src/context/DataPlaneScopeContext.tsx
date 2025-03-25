import { createContext, useCallback, useContext, useState } from 'react';
import { useLocalStorage } from 'react-use';
import type { DataPlaneScopes } from 'stores/DetailsForm/types';
import type { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

interface DataPlaneScope {
    dataPlaneScope: DataPlaneScopes;
    toggleScope: Function;
}

const defaultOption: DataPlaneScopes = 'private';
const DataPlaneScopeContext = createContext<DataPlaneScope | null>(null);

const DataPlaneScopeContextProvider = ({ children }: BaseComponentProps) => {
    const [defaultDataPlane, setDefaultDataPlane] =
        useLocalStorage<DataPlaneScopes>(
            LocalStorageKeys.DATAPLANE_CHOICE,
            defaultOption
        );

    const [dataPlaneScope, setDataPlaneScope] = useState<DataPlaneScopes>(
        defaultDataPlane ?? defaultOption
    );

    const toggleScope = useCallback(() => {
        const newVal = dataPlaneScope === 'public' ? 'private' : 'public';
        setDataPlaneScope(newVal);
        setDefaultDataPlane(newVal);
    }, [dataPlaneScope, setDefaultDataPlane]);

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
