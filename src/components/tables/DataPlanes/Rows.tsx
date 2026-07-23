import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import { Stack, TableCell, TableRow, useTheme } from '@mui/material';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import { getEntityTableRowSx } from 'src/context/Theme';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { getRegionDisplayName } from 'src/utils/cloudRegions';
import { toPresentableName } from 'src/utils/dataPlane-utils';

function Row({ row, rowSx, onRowClick }: RowProps) {
    const parseCidrBlocks = useParseCidrBlocks();
    const { ipv4 } = parseCidrBlocks(row.cidrBlocks);

    return (
        <TableRow
            hover
            sx={{
                ...rowSx,
                '& td': {
                    py: 1,
                },
            }}
            onClick={() => onRowClick(row)}
        >
            <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                    <DataPlaneIcon
                        provider={row.cloudProvider}
                        scope={row.scope}
                        size={20}
                    />
                </Stack>
            </TableCell>
            <TableCell>{toPresentableName(row)}</TableCell>
            <TableCell>
                {getRegionDisplayName(row.cloudProvider, row.region)}
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace' }}>{ipv4}</TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const theme = useTheme();

    const [selectedRow, setSelectedRow] = useState<DataPlaneNode | null>(null);

    const handleRowClick = (row: DataPlaneNode) => {
        setSelectedRow(row);
    };

    const handleCloseModal = () => {
        setSelectedRow(null);
    };

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.name}
                    row={row}
                    rowSx={getEntityTableRowSx(theme)}
                    onRowClick={handleRowClick}
                />
            ))}
            {selectedRow ? (
                <DataPlaneDialog
                    onClose={handleCloseModal}
                    dataPlane={selectedRow}
                />
            ) : null}
        </>
    );
}

export default Rows;
