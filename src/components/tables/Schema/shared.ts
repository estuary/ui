import type { TableColumns } from 'src/types';

export const columns: TableColumns[] = [
    {
        field: 'name',
        headerIntlKey: 'data.field',
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
    },
];

export const ROW_TYPE_STRING = 'string';
