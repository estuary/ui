import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import {
    Stack,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import { getEntityTableRowSx } from 'src/context/Theme';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    getProviderShortName,
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';

function Row({ row, rowSx, onRowClick }: RowProps) {
    const { dataPlaneName, scope } = generateDataPlaneOption(row);
    const parseCidrBlocks = useParseCidrBlocks();
    const { ipv4 } = parseCidrBlocks(row.cidr_blocks);

    return (
        <TableRow
            hover
            sx={{
                ...rowSx,
                'cursor': 'pointer',
                '& .info-icon': {
                    opacity: 0,
                    transition: 'opacity 0.15s ease-in-out',
                },
                '&:hover .info-icon': {
                    opacity: 1,
                },
                '&:hover .hover-link': {
                    textDecoration: 'underline',
                },
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
                    <Typography>
                        {getProviderShortName(dataPlaneName.provider)}
                    </Typography>
                </Stack>
            </TableCell>
            <TableCell className="hover-link">
                {getRegionDisplayName(
                    dataPlaneName.provider,
                    dataPlaneName.region
                )}
            </TableCell>
            <TableCell className="hover-link" sx={{ fontFamily: 'monospace' }}>
                {dataPlaneName.region}
            </TableCell>
            <TableCell className="hover-link" sx={{ fontFamily: 'monospace' }}>
                {ipv4}
            </TableCell>
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

            <DataPlaneDialog
                open={Boolean(selectedRow)}
                onClose={handleCloseModal}
                dataPlane={selectedRow}
            />
        </>
    );
}

export default Rows;
