import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { useState } from 'react';

import { Button, Stack, TableCell, TableRow, Typography } from '@mui/material';

import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { getRegionDisplayName } from 'src/utils/cloudRegions';
import { toPresentableName } from 'src/utils/dataPlane-utils';

function Row({ row, onOpen }: { row: DataPlaneNode; onOpen: () => void }) {
    const parseCidrBlocks = useParseCidrBlocks();
    const { ipv4 } = parseCidrBlocks(row.cidrBlocks);

    const dataPlaneDisplayName = toPresentableName(row);
    const regionDisplayName = getRegionDisplayName(
        row.cloudProvider,
        row.region
    );

    return (
        <TableRow hover>
            <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                    <DataPlaneIcon
                        provider={row.cloudProvider}
                        scope={row.scope}
                    />
                    <Typography variant="body2">
                        {dataPlaneDisplayName}
                    </Typography>
                </Stack>
            </TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>
                {regionDisplayName}
            </TableCell>
            <TableCell>
                <Stack
                    direction="row"
                    useFlexGap
                    spacing={0.5}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                    <Typography
                        component="code"
                        variant="body2"
                        sx={{
                            fontFamily: 'monospace',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {ipv4 ?? '—'}
                    </Typography>
                    {ipv4 ? (
                        <CopyToClipboardButton
                            label={`Copy IPv4 egress ranges for ${dataPlaneDisplayName}`}
                            writeValue={ipv4}
                        />
                    ) : null}
                </Stack>
            </TableCell>
            <TableCell align="right">
                <Button
                    variant="text"
                    size="small"
                    aria-label={`Details for ${dataPlaneDisplayName}`}
                    onClick={onOpen}
                >
                    Details
                </Button>
            </TableCell>
        </TableRow>
    );
}

interface RowsProps {
    data: DataPlaneNode[];
}

function Rows({ data }: RowsProps) {
    const [selectedRow, setSelectedRow] = useState<DataPlaneNode | null>(null);

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.name}
                    row={row}
                    onOpen={() => setSelectedRow(row)}
                />
            ))}
            {selectedRow ? (
                <DataPlaneDialog
                    onClose={() => setSelectedRow(null)}
                    dataPlane={selectedRow}
                />
            ) : null}
        </>
    );
}

export default Rows;
