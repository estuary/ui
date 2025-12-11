import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useMemo, useState } from 'react';

import { Collapse, Stack, TableCell, TableRow, useTheme } from '@mui/material';

import ExpandRowButton from '../cells/logs/ExpandRowButton';
import { InfoCircle } from 'iconoir-react';

import SingleLineCode from 'src/components/content/SingleLineCode';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import CopyCidrBlocks from 'src/components/shared/CopyCidrBlocks';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'src/context/Theme';
import { CollapsibleGroup } from 'src/forms/renderers/CollapsibleGroup';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
    rowSx: any;
}

function Row({ row, rowSx }: RowProps) {
    const dataPlaneOption = generateDataPlaneOption(row);
    const parseCidrBlocks = useParseCidrBlocks();

    const [expanded, setExpanded] = useState(false);

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
            onClick={() => setExpanded(!expanded)}
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

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.id}
                    row={row}
                    rowSx={getEntityTableRowSx(theme)}
                />
            ))}
        </>
    );
}

export default Rows;
