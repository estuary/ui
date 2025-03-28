import { useMemo } from 'react';

import { catalogNameColumn, publishedColumn } from './shared';

import { ColumnProps } from 'src/components/tables/EntityTable/types';

const defaultColumns: ColumnProps[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: catalogNameColumn,
        headerIntlKey: 'entityTable.data.userFullName',
    },
    {
        field: publishedColumn,
        headerIntlKey: 'entityTable.data.lastPublished',
    },
];

const optionalColumns = {
    writesTo: {
        field: null,
        headerIntlKey: 'entityTable.data.writesTo',
    } as ColumnProps,

    readsFrom: {
        field: null,
        headerIntlKey: 'entityTable.data.readsFrom',
    } as ColumnProps,
};

export type OptionalColumn = keyof typeof optionalColumns;

export const useCollectionsSelectorColumns = (
    include?: OptionalColumn
): ColumnProps[] => {
    return useMemo(() => {
        if (include) {
            const response = [...defaultColumns];
            response.splice(2, 0, optionalColumns[include]);
            return response;
        } else {
            return defaultColumns;
        }
    }, [include]);
};
