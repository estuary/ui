import {
    Box,
    Collapse,
    Stack,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { useState } from 'react';
import { doubleElevationHoverBackground } from 'context/Theme';
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
    const theme = useTheme();
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
            aria-expanded={hasFields ? open : undefined}
            aria-describedby={id}
            hover={Boolean(hasFields && !open)}
            selected={open}
            style={style}
            sx={{
                cursor: hasFields ? 'pointer' : undefined,
                borderLeft: open ? '5px solid' : undefined,
                borderLeftColor:
                    doubleElevationHoverBackground[theme.palette.mode],
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
                                px: 3,
                                opacity: opening ? 0 : undefined,
                            }}
                        >
                            <Typography sx={{ my: 2 }}>
                                {row.message}
                            </Typography>

                            <Box
                            // sx={{
                            //     height: 200,
                            //     maxHeight: 200,
                            //     overflow: 'auto',
                            // }}
                            >
                                <FieldsExpandedCell fields={row.fields} />
                            </Box>
                        </Box>
                    </Collapse>
                ) : null}
            </Stack>
        </TableRow>
    );
}
