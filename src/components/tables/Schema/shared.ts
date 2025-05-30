import type { TableColumns } from 'src/types';

export const actionColumn: TableColumns = {
    field: null,
    headerIntlKey: 'data.actions',
};

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
    {
        field: null,
        headerIntlKey: 'data.details',
        minWidth: 300,
    },
];

export const ROW_TYPE_STRING = 'string';
