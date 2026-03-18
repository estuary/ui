import type { TableColumnSelectorProps } from 'src/components/tables/types';

import SelectColumnMenu from 'src/components/tables/SelectColumnMenu';
import { useDisplayTableColumnSetter } from 'src/context/TableSettings';

export default function TableColumnSelector({
    loading,
    optionalColumns,
    tablePrefix,
}: TableColumnSelectorProps) {
    const updateTableSettings = useDisplayTableColumnSetter(tablePrefix);

    return (
        <SelectColumnMenu
            columns={optionalColumns}
            onChange={updateTableSettings}
            disabled={loading}
            tablePrefix={tablePrefix}
        />
    );
}
