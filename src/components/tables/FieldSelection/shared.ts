import type { SortDirection, TableColumns } from 'src/types';

import {
    basicSort_string,
    compareInitialCharacterType,
} from 'src/utils/misc-utils';

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

export const sortByField = (
    a: { field: string; isKey: boolean },
    b: { field: string; isKey: boolean },
    sortDirection: SortDirection
) => {
    const sortResult = compareInitialCharacterType(a.field, b.field);

    if (typeof sortResult === 'number') {
        return sortResult;
    }

    // If a is not a key and b is then return >0 to put b first
    if (!a.isKey && b.isKey) {
        return 1;
    }

    // If a is a key and b is not then return <0 to put a first
    if (a.isKey && !b.isKey) {
        return -1;
    }

    return basicSort_string(a.field, b.field, sortDirection);
};
