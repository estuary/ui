import { TableColumns } from 'types';
import useConstant from 'use-constant';
import { ColumnProps } from '../EntityTable/types';

const defaultColumns: TableColumns[] = [
    {
        field: null,
        align: 'right',
        collapseHeader: true,
        headerIntlKey: 'ops.logsTable.label.level',
    },
    {
        field: null,
        collapseHeader: true,
        headerIntlKey: 'ops.logsTable.label.ts',
    },
    {
        field: null,
        headerIntlKey: 'ops.logsTable.label.message',
    },
];

const useLogColumns = (): ColumnProps[] => {
    return useConstant(() => defaultColumns);
};

export default useLogColumns;
