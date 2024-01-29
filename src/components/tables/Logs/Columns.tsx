import { Box, Stack } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

interface RowProps {
    row: OpsLogFlowDocument;
    open: boolean;
    opening: boolean;
    toggleRowHeight: any;
}

export function LogsTableColumns({
    row,
    open,
    opening,
    toggleRowHeight,
}: RowProps) {
    const hasFields = Boolean(row.fields);

    return (
        <Stack>
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
                    toggleRowHeight={toggleRowHeight}
                />
            ) : null}
        </Stack>
    );
}
