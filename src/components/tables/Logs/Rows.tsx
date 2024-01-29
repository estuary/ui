import { Box, Stack, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { useState } from 'react';
import { doubleElevationHoverBackground } from 'context/Theme';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';
import { DEFAULT_ROW_HEIGHT } from './shared';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    lastRow?: boolean;
    style?: any;
}

export function Row({ lastRow, row, rowExpanded, style }: RowProps) {
    const theme = useTheme();
    const hasFields = Boolean(row.fields);
    const renderedHeight = style?.height ?? DEFAULT_ROW_HEIGHT;

    const [open, setOpen] = useState(renderedHeight > DEFAULT_ROW_HEIGHT);
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
                paddingBottom: lastRow ? 1 : undefined,
                bgcolor: lastRow ? 'red' : undefined,
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
        </TableRow>
    );
}
