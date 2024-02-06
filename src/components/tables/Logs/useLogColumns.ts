import { TableColumns } from 'types';
import useConstant from 'use-constant';
import { ColumnProps } from '../EntityTable/types';

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
