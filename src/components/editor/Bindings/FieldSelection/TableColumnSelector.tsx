import type { SyntheticEvent } from 'react';
import type { TableColumns } from 'types';
import type { WithRequiredNonNullProperty } from 'types/utils';
import { optionalColumnIntlKeys } from 'components/tables/FieldSelection';
import SelectColumnMenu from 'components/tables/SelectColumnMenu';
import { useDisplayTableColumns } from 'context/TableSettings';
import { TablePrefixes } from 'stores/Tables/hooks';
import { hasLength } from 'utils/misc-utils';

interface Props {
    columns: TableColumns[];
    loading: boolean;
}

export default function TableColumnSelector({ columns, loading }: Props) {
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
