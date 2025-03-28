import type { RefCallback } from 'react';
import type { OpsLogFlowDocument } from 'src/types';

import { Box, Stack } from '@mui/material';

import FieldsExpandedCell from 'src/components/tables/cells/logs/FieldsExpandedCell';
import LevelCell from 'src/components/tables/cells/logs/LevelCell';
import MessageCell from 'src/components/tables/cells/logs/MessageCell';
import TimestampCell from 'src/components/tables/cells/logs/TimestampCell';

interface RowProps {
    row: OpsLogFlowDocument;
    sizeRef: RefCallback<HTMLElement>;
    open: boolean;
    heightChanging: boolean;
}

export function LogsTableColumns({
    row,
    sizeRef,
    open,
    heightChanging,
}: RowProps) {
    return (
        <Stack ref={sizeRef}>
            <Box>
                <LevelCell expanded={open} row={row} />

                <TimestampCell ts={row.ts} />

                <MessageCell message={row.message} fields={row.fields} />
            </Box>
            <FieldsExpandedCell
                fields={row.fields}
                uuid={row._meta.uuid}
                message={row.message}
                open={open}
                heightChanging={heightChanging}
            />
        </Stack>
    );
}
