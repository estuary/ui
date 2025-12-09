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
        field: null,
        headerIntlKey: ' ',
        width: 37,
    },
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

// It should be noted that /_meta/flow_truncated and /_meta/uuid
// are synthetic locations.
export const redactionRestrictedLocations = [
    '/_meta/flow_truncated',
    '/_meta/inferredSchemaIsNotAvailable',
    '/_meta/uuid',
];
