import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';
import type { BaseComponentProps } from 'src/types';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useLocalStorage } from 'react-use';

import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface DataPlaneScope {
    dataPlaneScope: DataPlaneScopes;
    setScope: (newScope: DataPlaneScopes) => void;
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

    const setScope = useCallback(
        (newScope: DataPlaneScopes) => {
            setDataPlaneScope(newScope);
            setDefaultDataPlane(newScope);
        },
        [setDefaultDataPlane]
    );

    const value = useMemo(
        () => ({
            dataPlaneScope,
            setScope,
        }),
        [dataPlaneScope, setScope]
    );

    return (
        <DataPlaneScopeContext.Provider value={value}>
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
