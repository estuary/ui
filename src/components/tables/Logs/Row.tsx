import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { useState } from 'react';
import { doubleElevationHoverBackground } from 'context/Theme';
import { DEFAULT_ROW_HEIGHT } from './shared';
import { LogsTableColumns } from './Columns';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    style?: any;
}

export function LogsTableRow({ row, rowExpanded, style }: RowProps) {
    // const startOfLogs = row._meta.uuid === START_OF_LOGS_UUID;

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
            }}
            onClick={hasFields ? handleClick : undefined}
        >
            <LogsTableColumns
                row={row}
                open={open}
                opening={opening}
                toggleRowHeight={toggleRowHeight}
            />
        </TableRow>
    );
}
