import type { Dispatch, SetStateAction } from 'react';
import type { TablePrefix } from 'src/stores/Tables/hooks';
import type { BaseComponentProps } from 'src/types';

import { createContext, useCallback, useContext } from 'react';

import { useLocalStorage, useMount } from 'react-use';

import { alertHistoryOptionalColumnIntlKeys } from 'src/components/tables/AlertHistory/shared';
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

export const TableSettingsProvider = ({ children }: BaseComponentProps) => {
    const [tableSettings, setTableSettings] =
        useLocalStorage<TableSettingsDictionary>(
            LocalStorageKeys.TABLE_SETTINGS,
            {
                [TablePrefixes.alertHistoryForEntity]: {
                    shownOptionalColumns: [],
                },
                [TablePrefixes.alertHistoryForTenant]: {
                    shownOptionalColumns: [
                        alertHistoryOptionalColumnIntlKeys.entityName,
                    ],
                },
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

        if (!tableSettings?.[TablePrefixes.alertHistoryForEntity]) {
            setTableSettings({
                ...tableSettings,
                [TablePrefixes.alertHistoryForEntity]: {
                    shownOptionalColumns: [],
                },
            });
        }

        if (!tableSettings?.[TablePrefixes.alertHistoryForTenant]) {
            setTableSettings({
                ...tableSettings,
                [TablePrefixes.alertHistoryForTenant]: {
                    shownOptionalColumns: [
                        alertHistoryOptionalColumnIntlKeys.entityName,
                    ],
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

export const useDisplayTableColumns = () => {
    const context = useContext(TableSettingsContext);

    if (context === null) {
        throw new Error(
            'useDisplayTableColumns must be used within a TableSettingsProvider'
        );
    }

    return context;
};

export const useDisplayTableColumnSetter = (tablePrefix: TablePrefix) => {
    const { tableSettings, setTableSettings } = useDisplayTableColumns();
    return useCallback(
        (checked: boolean, column: string) => {
            const existingSettings = tableSettings ?? {};

            const shownOptionalColumns = Object.hasOwn(
                existingSettings,
                tablePrefix
            )
                ? existingSettings[tablePrefix].shownOptionalColumns
                : [];

            const columnShown = shownOptionalColumns.includes(column);

            const evaluatedSettings =
                !checked && columnShown
                    ? {
                          ...existingSettings,
                          [tablePrefix]: {
                              shownOptionalColumns: shownOptionalColumns.filter(
                                  (value) => value !== column
                              ),
                          },
                      }
                    : checked && !columnShown
                      ? {
                            ...existingSettings,
                            [tablePrefix]: {
                                shownOptionalColumns: [
                                    ...shownOptionalColumns,
                                    column,
                                ],
                            },
                        }
                      : existingSettings;

            setTableSettings(evaluatedSettings);
        },
        [setTableSettings, tablePrefix, tableSettings]
    );
};
