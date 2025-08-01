import type { TablePrefix } from 'src/stores/Tables/hooks';

import { Box } from '@mui/material';

interface Props {
    tablePrefix: TablePrefix;
}

function AlertHistoryTable({ tablePrefix }: Props) {
    return (
        <Box>
            <textarea value="Notifications Table" />
        </Box>
    );
}

export default AlertHistoryTable;
