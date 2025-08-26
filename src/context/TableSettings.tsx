import type { Dispatch, SetStateAction } from 'react';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext } from 'react';

import { useLocalStorage, useMount } from 'react-use';

import { TablePrefixes } from 'src/stores/Tables/hooks';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface TableSettings {
    shownOptionalColumns: string[];
}

interface TableSettingsDictionary {
    [key: string]: TableSettings;
}

export interface TableSettingsState {
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
            {
                [TablePrefixes.fieldSelection]: {
                    shownOptionalColumns: [],
                },
                [TablePrefixes.schemaViewer]: {
                    shownOptionalColumns: [],
                },
            }
        );

    useMount(() => {
        if (!tableSettings?.[TablePrefixes.fieldSelection]) {
            setTableSettings({
                ...tableSettings,
                [TablePrefixes.fieldSelection]: {
                    shownOptionalColumns: [],
                },
            });
        }

        if (!tableSettings?.[TablePrefixes.schemaViewer]) {
            setTableSettings({
                ...tableSettings,
                [TablePrefixes.schemaViewer]: {
                    shownOptionalColumns: [],
                },
            });
        }
    });

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
