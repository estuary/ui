import { Stack, TableCell, Typography } from '@mui/material';

import StatusIndicator from 'src/components/tables/cells/entityStatus/ControllerStatus/StatusIndicator';
import type { ControllerStatusProps } from 'src/components/tables/cells/entityStatus/ControllerStatus/types';

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
