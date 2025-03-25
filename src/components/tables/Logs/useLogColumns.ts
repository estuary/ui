import type { TableColumns } from 'types';
import type { ColumnProps } from '../EntityTable/types';
import useConstant from 'use-constant';

const defaultColumns: TableColumns[] = [
    {
        field: null,
        align: 'right',
        headerIntlKey: 'ops.logsTable.label.level',
        width: 65,
        display: 'inline-block',
    },
    {
        field: null,
        headerIntlKey: 'ops.logsTable.label.ts',
        width: 245,
        display: 'inline-block',
    },
    {
        field: null,
        headerIntlKey: 'ops.logsTable.label.message',
        display: 'inline-block',
        flexGrow: true,
    },
];

const useLogColumns = (): ColumnProps[] => {
    return useConstant(() => defaultColumns);
};

export default useLogColumns;
