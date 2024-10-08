import { ColumnProps } from 'components/tables/EntityTable/types';
import { useMemo } from 'react';
import { catalogNameColumn, publishedColumn } from './shared';

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

const useCollectionsSelectorColumns = (
    include?: keyof typeof optionalColumns
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

export default useCollectionsSelectorColumns;
