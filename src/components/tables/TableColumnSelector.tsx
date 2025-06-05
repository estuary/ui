import type { SyntheticEvent } from 'react';
import type { TableColumnSelectorProps } from 'src/components/tables/types';

import SelectColumnMenu from 'src/components/tables/SelectColumnMenu';
import { useDisplayTableColumns } from 'src/context/TableSettings';

export default function TableColumnSelector({
    loading,
    optionalColumns,
    tablePrefix,
}: TableColumnSelectorProps) {
    const { tableSettings, setTableSettings } = useDisplayTableColumns();

    const updateTableSettings = (
        event: SyntheticEvent,
        checked: boolean,
        column: string
    ) => {
        event.preventDefault();
        event.stopPropagation();

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
    };

    return (
        <SelectColumnMenu
            columns={optionalColumns}
            onChange={updateTableSettings}
            disabled={loading}
            tablePrefix={tablePrefix}
        />
    );
}
