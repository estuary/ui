import {
    Box,
    Grow,
    Popper,
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
    style?: any;
}

interface RowsProps {
    data: OpsLogFlowDocument[];
    loading?: boolean;
    hitFileStart?: boolean;
}

export function Row({ row, style }: RowProps) {
    const hasFields = Boolean(row.fields);

    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | any>(null);
    const [popperWidth, setPopperWidth] = useState<number>(0);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setPopperWidth(event.currentTarget.offsetWidth);
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    const expanded = open && Boolean(anchorEl);
    const id = expanded ? `jsonPopper_${row._meta.uuid}` : undefined;

    return (
        <TableRow
            component={Box}
            hover={hasFields}
            aria-expanded={hasFields ? expanded : undefined}
            aria-describedby={id}
            style={style}
            selected={expanded}
            sx={{
                cursor: hasFields ? 'pointer' : undefined,
            }}
            onClick={hasFields ? handleClick : undefined}
        >
            <LevelCell
                disableExpand={!hasFields}
                expanded={expanded}
                row={row}
            />

            <TimestampCell ts={row.ts} />

            <MessageCell message={row.message} fields={row.fields} />
            {hasFields ? (
                <Popper
                    id={id}
                    open={expanded}
                    anchorEl={anchorEl}
                    onResize={undefined}
                    onResizeCapture={undefined}
                    placement="bottom-start"
                    style={{ width: popperWidth }}
                    transition
                >
                    {({ TransitionProps }) => (
                        <Grow {...TransitionProps} timeout={350}>
                            <Box
                                sx={{
                                    border: 1,
                                    p: 1,
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Typography>{row.message}</Typography>
                                <FieldsExpandedCell fields={row.fields} />
                            </Box>
                        </Grow>
                    )}
                </Popper>
            ) : null}
        </TableRow>
    );
}

function Rows({ data, loading, hitFileStart }: RowsProps) {
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
            {data.map((record) => (
                <Row row={record} key={record._meta.uuid} />
            ))}
        </>
    );
}

export default Rows;
