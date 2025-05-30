import type { OptionalTableColumn, TableColumns } from 'src/types';

export const actionColumn: TableColumns = {
    field: null,
    headerIntlKey: 'data.actions',
};

export const optionalColumns: OptionalTableColumn[] = [
    {
        field: null,
        headerIntlKey: 'data.details',
        insertAfterIntlKey: 'data.type',
        minWidth: 300,
    },
];

export const columns: TableColumns[] = [
    {
        field: 'name',
        headerIntlKey: 'data.field',
        sticky: true,
    },
    {
        field: 'pointer',
        headerIntlKey: 'data.location',
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
];

export const ROW_TYPE_STRING = 'string';
