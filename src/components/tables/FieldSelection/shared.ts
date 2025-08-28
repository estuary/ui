import type { TableColumns } from 'src/types';

export const optionalColumnIntlKeys = {
    pointer: 'data.location',
};

export const optionalColumns = Object.values(optionalColumnIntlKeys);

export const tableColumns: TableColumns[] = [
    {
        field: 'field',
        headerIntlKey: 'data.field',
        columnWraps: true,
    },
    {
        field: 'ptr',
        headerIntlKey: optionalColumnIntlKeys.pointer,
        columnWraps: true,
    },
    {
        field: null,
        headerIntlKey: 'data.type',
        collapseHeader: true,
    },
    {
        field: null,
        headerIntlKey: 'data.actions',
        width: 148,
    },
    {
        field: null,
        headerIntlKey: 'data.outcome',
        width: 50,
    },
];
