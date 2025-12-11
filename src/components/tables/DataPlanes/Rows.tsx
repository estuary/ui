import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useMemo, useState } from 'react';

import { Stack, TableCell, TableRow, useTheme } from '@mui/material';

import { InfoCircle } from 'iconoir-react';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import { getEntityTableRowSx } from 'src/context/Theme';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
    rowSx: any;
    onRowClick: (row: BaseDataPlaneQuery) => void;
}

function Row({ row, rowSx, onRowClick }: RowProps) {
    const dataPlaneOption = generateDataPlaneOption(row);
    const parseCidrBlocks = useParseCidrBlocks();

    const splitCidrBlocks = useMemo(
        () => parseCidrBlocks(row.cidr_blocks),
        [row.cidr_blocks, parseCidrBlocks]
    );

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
            }}
            onClick={() => onRowClick(row)}
        >
            <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <InfoCircle className="info-icon" fontSize={12} />

                    {Boolean(dataPlaneOption.dataPlaneName) ? (
                        <DataPlane
                            dataPlaneName={dataPlaneOption.dataPlaneName}
                            formattedSuffix={formatDataPlaneName(
                                dataPlaneOption.dataPlaneName
                            )}
                            hidePrefix
                            logoSize={30}
                            scope={dataPlaneOption.scope}
                        />
                    ) : null}
                </Stack>
            </TableCell>
            <TableCell>
                <TechnicalEmphasis>{splitCidrBlocks.ipv4}</TechnicalEmphasis>
            </TableCell>
            <TableCell>
                <TechnicalEmphasis>{splitCidrBlocks.ipv6}</TechnicalEmphasis>
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
