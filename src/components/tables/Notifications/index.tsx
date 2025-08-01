import type { TablePrefix } from 'src/stores/Tables/hooks';

import { Box } from '@mui/material';

interface Props {
    tablePrefix: TablePrefix;
    showUser?: boolean;
}

function NotificationsTable({ tablePrefix, showUser }: Props) {
    return (
        <Box sx={{ mb: showUser ? 8 : 0 }}>
            <textarea value="Notifications Table" />
        </Box>
    );
}

export default NotificationsTable;
