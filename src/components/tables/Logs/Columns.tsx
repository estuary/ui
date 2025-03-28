import { RefCallback } from 'react';

import { Box, Stack } from '@mui/material';

import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';
import LevelCell from '../cells/logs/LevelCell';
import MessageCell from '../cells/logs/MessageCell';
import TimestampCell from '../cells/logs/TimestampCell';

import { OpsLogFlowDocument } from 'src/types';

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
