import type { RowsProps } from 'src/components/tables/StorageMappings/types';

import { TableCell, TableRow, useTheme } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';
import { useDialog } from 'src/hooks/useDialog';

function Rows({ data }: RowsProps) {
    const theme = useTheme();

    const { onOpen } = useDialog('EDIT_STORAGE_MAPPING');

    const handleRowClick = (row: (typeof data)[0]) => {
        onOpen({ prefix: row.catalog_prefix });
    };

    return (
        <>
            {data.map((row) => {
                const store = row.spec.stores[0];

                return (
                    <TableRow
                        hover
                        key={`StorageMappings-${row.id}`}
                        sx={getEntityTableRowSx(theme)}
                        onClick={() => handleRowClick(row)}
                    >
                        <TableCell>{row.catalog_prefix}</TableCell>

                        <ChipListCell
                            values={row.spec.data_planes ?? []}
                            maxChips={3}
                            stripPath={false}
                        />

                        <TableCell>
                            {store.provider}/{store.bucket}
                        </TableCell>

                        <TableCell>{store.prefix}</TableCell>

                        <TimeStamp time={row.updated_at} enableRelative />
                    </TableRow>
                );
            })}
        </>
    );
}

export default Rows;
