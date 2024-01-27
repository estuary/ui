import {
    Box,
    Collapse,
    Stack,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import LevelIcon from '../cells/logs/LevelIcon';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    style?: any;
}

interface RowsProps {
    data: OpsLogFlowDocument[];
    loading?: boolean;
    hitFileStart?: boolean;
}

export function Row({ row, rowExpanded, style }: RowProps) {
    const hasFields = Boolean(row.fields);

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen((previousOpen) => !previousOpen);
    };

    const id = open ? `jsonPopper_${row._meta.uuid}` : undefined;

    return (
        <TableRow
            component={Box}
            hover={hasFields}
            aria-expanded={hasFields ? open : undefined}
            aria-describedby={id}
            style={style}
            selected={open}
            sx={{
                cursor: hasFields ? 'pointer' : undefined,
            }}
            onClick={hasFields ? handleClick : undefined}
        >
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
                    <Collapse
                        key={`jsonPopper_${row._meta.uuid}`}
                        in={open}
                        onClick={(event) => {
                            // When clicking inside here we don't want to close the row
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        onEntered={(target) => rowExpanded(target.offsetHeight)}
                        onExited={(target) => rowExpanded(target.offsetHeight)}
                        sx={{
                            bgcolor: 'white',
                        }}
                        unmountOnExit
                    >
                        <Box
                            sx={{
                                height: 200,
                                maxHeight: 200,
                                overflow: 'auto',
                                mx: 3,
                                borderBottom: 1,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Typography>{row.message}</Typography>
                            <FieldsExpandedCell fields={row.fields} />
                        </Box>
                    </Collapse>
                ) : null}
            </Stack>
        </TableRow>
    );
}

function Rows({ loading, hitFileStart }: RowsProps) {
    return (
        <>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={3}>
                        <FormattedMessage id="ops.logsTable.fetchingOlderLogs" />
                    </TableCell>
                </TableRow>
            ) : null}
            {hitFileStart ? (
                <TableRow>
                    <TableCell align="right">
                        <LevelIcon level="done" />
                    </TableCell>
                    <TableCell colSpan={2}>
                        <FormattedMessage id="ops.logsTable.allOldLogsLoaded" />
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
}

export default Rows;
