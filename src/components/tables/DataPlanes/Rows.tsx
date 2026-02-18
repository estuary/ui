import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import type { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
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
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';

function Row({ row, rowSx, onRowClick }: RowProps) {
    const { dataPlaneName, scope } = generateDataPlaneOption(row);
    const parseCidrBlocks = useParseCidrBlocks();
    const { ipv4 } = parseCidrBlocks(row.cidr_blocks);

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
                        provider={dataPlaneName.provider}
                        scope={scope}
                        size={20}
                    />
                </Stack>
            </TableCell>
            <TableCell>{formatDataPlaneName(dataPlaneName)}</TableCell>
            <TableCell>
                {getRegionDisplayName(
                    dataPlaneName.provider as CloudProvider,
                    dataPlaneName.region
                )}
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace' }}>{ipv4}</TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const theme = useTheme();

    const [selectedRow, setSelectedRow] = useState<BaseDataPlaneQuery | null>(
        null
    );

    const handleRowClick = (row: BaseDataPlaneQuery) => {
        setSelectedRow(row);
    };

    const handleCloseModal = () => {
        setSelectedRow(null);
    };

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.id}
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
