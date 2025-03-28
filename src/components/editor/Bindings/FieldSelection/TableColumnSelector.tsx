import { optionalColumnIntlKeys } from 'src/components/tables/FieldSelection/shared';
import SelectColumnMenu from 'src/components/tables/SelectColumnMenu';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { SyntheticEvent } from 'react';
import { TablePrefixes } from 'src/stores/Tables/hooks';
import { TableColumns } from 'src/types';
import { WithRequiredNonNullProperty } from 'src/types/utils';
import { hasLength } from 'src/utils/misc-utils';
import { TableColumnSelectorProps } from './types';

export default function TableColumnSelector({
    columns,
    loading,
}: TableColumnSelectorProps) {
    const { tableSettings, setTableSettings } = useDisplayTableColumns();

    const optionalColumns = columns.filter(
        (
            column
        ): column is WithRequiredNonNullProperty<
            TableColumns,
            'headerIntlKey'
        > =>
            typeof column.headerIntlKey === 'string' &&
            hasLength(column.headerIntlKey)
                ? Object.values(optionalColumnIntlKeys).includes(
                      column.headerIntlKey
                  )
                : false
    );

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
            TablePrefixes.fieldSelection
        )
            ? existingSettings[TablePrefixes.fieldSelection]
                  .shownOptionalColumns
            : [];

        const columnShown = shownOptionalColumns.includes(column);

        const evaluatedSettings =
            !checked && columnShown
                ? {
                      ...existingSettings,
                      [TablePrefixes.fieldSelection]: {
                          shownOptionalColumns: shownOptionalColumns.filter(
                              (value) => value !== column
                          ),
                      },
                  }
                : checked && !columnShown
                  ? {
                        ...existingSettings,
                        [TablePrefixes.fieldSelection]: {
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
        />
    );
}
