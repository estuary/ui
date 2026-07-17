import type { StorageMappingTableRow } from 'src/api/gql/storageMappings';

import { TableCell, TableRow, useTheme } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import { getEntityTableRowSx } from 'src/context/Theme';
import { useDialog } from 'src/hooks/useDialog';

function Rows({ data }: { data: StorageMappingTableRow[] }) {
    const theme = useTheme();

    const { onOpen } = useDialog('EDIT_STORAGE_MAPPING');

    const handleRowClick = (row: StorageMappingTableRow) => {
        onOpen({ prefix: row.catalogPrefix });
    };

    return (
        <>
            {data.map((row) => {
                const store = row.spec.stores?.[0];

                return (
                    <TableRow
                        hover
                        key={`StorageMappings-${row.catalogPrefix}`}
                        sx={getEntityTableRowSx(theme)}
                        onClick={() => handleRowClick(row)}
                    >
                        <TableCell>{row.catalogPrefix}</TableCell>

                        <ChipListCell
                            values={row.spec.data_planes}
                            maxChips={3}
                            stripPath={false}
                        />

                        <TableCell>
                            {store ? `${store.provider}/${store.bucket}` : null}
                        </TableCell>

                        <TableCell>{store?.prefix}</TableCell>
                    </TableRow>
                );
            })}
        </>
    );
}

export default Rows;
