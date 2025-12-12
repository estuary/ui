import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useState } from 'react';

import {
    Stack,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';

import { InfoCircle } from 'iconoir-react';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import { getEntityTableRowSx } from 'src/context/Theme';
import {
    getProviderShortName,
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
    rowSx: any;
    onRowClick: (row: BaseDataPlaneQuery) => void;
}

function Row({ row, rowSx, onRowClick }: RowProps) {
    const { dataPlaneName, scope } = generateDataPlaneOption(row);

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
                '& td': {
                    py: 1,
                },
            }}
            onClick={() => onRowClick(row)}
        >
            <TableCell>
                <InfoCircle
                    className="info-icon"
                    fontSize={12}
                    style={{ display: 'block' }}
                />
            </TableCell>
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
            <TableCell>
                {getRegionDisplayName(
                    dataPlaneName.provider,
                    dataPlaneName.region
                )}
            </TableCell>
            <TableCell>{dataPlaneName.region}</TableCell>
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
