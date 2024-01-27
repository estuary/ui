import { Box, Collapse, Stack, TableRow, Typography } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { useState } from 'react';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    renderExpanded?: boolean;
    style?: any;
}

export function Row({ renderExpanded, row, rowExpanded, style }: RowProps) {
    const hasFields = Boolean(row.fields);

    const [open, setOpen] = useState(renderExpanded ?? false);
    const [opening, setOpening] = useState(false);

    const handleClick = () => {
        setOpening(true);
        setOpen((previousOpen) => !previousOpen);
    };

    const toggleRowHeight = (target: HTMLElement) => {
        rowExpanded(target.offsetHeight);
        setOpening(false);
    };

    const id = open ? `jsonPopper_${row._meta.uuid}` : undefined;

    return (
        <TableRow
            component={Box}
            hover={hasFields}
            aria-expanded={hasFields ? open : undefined}
            aria-describedby={id}
            style={style}
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
                        onEntered={toggleRowHeight}
                        onExited={toggleRowHeight}
                        unmountOnExit
                    >
                        <Box
                            sx={{
                                height: 200,
                                maxHeight: 200,
                                overflow: 'auto',
                                mx: 3,
                                borderBottom: 1,
                                opacity: opening ? 0 : undefined,
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
