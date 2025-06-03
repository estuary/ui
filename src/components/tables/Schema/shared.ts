import type { TableColumns } from 'src/types';

export const actionColumn: TableColumns = {
    field: null,
    headerIntlKey: 'data.actions',
};

export const optionalColumnIntlKeys = {
    details: 'data.details',
};

export const optionalColumns = Object.values(optionalColumnIntlKeys);

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
        headerIntlKey: optionalColumnIntlKeys.details,
        minWidth: 300,
    },
];

export const ROW_TYPE_STRING = 'string';
