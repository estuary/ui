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

const writesTo: ColumnProps = {
    field: null,
    headerIntlKey: 'entityTable.data.writesTo',
};

const useCollectionsSelectorColumns = (
    includeWritesTo: boolean
): ColumnProps[] => {
    return useMemo(() => {
        if (includeWritesTo) {
            const response = [...defaultColumns];
            response.splice(2, 0, writesTo);
            return response;
        } else {
            return defaultColumns;
        }
    }, [includeWritesTo]);
};

export default useCollectionsSelectorColumns;
