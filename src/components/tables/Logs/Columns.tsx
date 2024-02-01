import { Box, Stack } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { RefCallback } from 'react';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

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
            {Boolean(row.fields) ? (
                <FieldsExpandedCell
                    fields={row.fields}
                    uuid={row._meta.uuid}
                    message={row.message}
                    open={open}
                    heightChanging={heightChanging}
                />
            ) : null}
        </Stack>
    );
}
