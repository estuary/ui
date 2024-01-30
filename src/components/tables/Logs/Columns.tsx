import { Box, Stack } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { RefCallback } from 'react';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

interface RowProps {
    sizeRef: RefCallback<HTMLElement>;
    row: OpsLogFlowDocument;
    open: boolean;
    opening: boolean;
}

export function LogsTableColumns({ sizeRef, row, open, opening }: RowProps) {
    const hasFields = Boolean(row.fields);

    return (
        <Stack ref={sizeRef}>
            <Box>
                <LevelCell
                    disableExpand={!hasFields}
                    expanded={open}
                    row={row}
                />

                <TimestampCell ts={row.ts} />

                <MessageCell message={row.message} fields={row.fields} />
            </Box>
            {hasFields ? (
                <FieldsExpandedCell
                    fields={row.fields}
                    uuid={row._meta.uuid}
                    message={row.message}
                    open={open}
                    opening={opening}
                />
            ) : null}
        </Stack>
    );
}
