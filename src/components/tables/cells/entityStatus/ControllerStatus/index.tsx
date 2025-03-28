import { Stack, TableCell, Typography } from '@mui/material';

import StatusIndicator from './StatusIndicator';
import { ControllerStatusProps } from './types';

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
