import type { Dispatch, SetStateAction } from 'react';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext } from 'react';

import { useLocalStorage } from 'react-use';

import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface TableSettings {
    shownOptionalColumns: string[];
}

interface TableSettingsDictionary {
    [key: string]: TableSettings;
}

interface TableSettingsState {
    tableSettings: TableSettingsDictionary | undefined;
    setTableSettings: Dispatch<
        SetStateAction<TableSettingsDictionary | undefined>
    >;
}

const TableSettingsContext = createContext<TableSettingsState | null>(null);

const TableSettingsProvider = ({ children }: BaseComponentProps) => {
    const [tableSettings, setTableSettings] =
        useLocalStorage<TableSettingsDictionary>(
            LocalStorageKeys.TABLE_SETTINGS,
            {}
        );

    return (
        <TableSettingsContext.Provider
            value={{ tableSettings, setTableSettings }}
        >
            {children}
        </TableSettingsContext.Provider>
    );
};

const useDisplayTableColumns = () => {
    const context = useContext(TableSettingsContext);

    if (context === null) {
        throw new Error(
            'useDisplayTableColumns must be used within a TableSettingsProvider'
        );
    }

    return context;
};

export { TableSettingsProvider, useDisplayTableColumns };
