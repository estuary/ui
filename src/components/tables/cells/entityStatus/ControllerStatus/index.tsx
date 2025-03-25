import type { ControllerStatusProps } from './types';
import { Stack, TableCell, Typography } from '@mui/material';
import StatusIndicator from './StatusIndicator';

export default function ControllerStatus({
    detail,
    status,
}: ControllerStatusProps) {
    return (
        <TableCell>
            <Stack direction="row" style={{ alignItems: 'center' }}>
                <StatusIndicator status={status} />

                <Typography>{detail}</Typography>
            </Stack>
        </TableCell>
    );
}
