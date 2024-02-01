import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { doubleElevationHoverBackground } from 'context/Theme';
import useResizeObserver from 'use-resize-observer';
import { DEFAULT_ROW_HEIGHT } from './shared';
import { LogsTableColumns } from './Columns';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    style?: CSSProperties;
}

export function LogsTableRow({ row, rowExpanded, style }: RowProps) {
    // const startOfLogs = row._meta.uuid === START_OF_LOGS_UUID;

    const theme = useTheme();
    const renderedHeight = style?.height ?? DEFAULT_ROW_HEIGHT;

    const [open, setOpen] = useState(renderedHeight > DEFAULT_ROW_HEIGHT);
    const [heightChanging, setHeightChanging] = useState(false);
    const previousHeight = useRef(renderedHeight);

    const { ref: sizeRef, height: rowSizeHeight } =
        useResizeObserver<HTMLElement>();

    useLayoutEffect(() => {
        if (!rowSizeHeight || rowSizeHeight === previousHeight.current) {
            return;
        }

        previousHeight.current = rowSizeHeight;
        rowExpanded(rowSizeHeight);
        setHeightChanging(false);
    }, [rowExpanded, rowSizeHeight]);

    const handleClick = () => {
        const newVal = !open;

        setHeightChanging(true);
        setOpen(newVal);
    };

    return (
        <TableRow
            component={Box}
            aria-expanded={open}
            hover={!open}
            selected={open}
            style={style}
            sx={{
                cursor: 'pointer',
                borderLeft: open ? '5px solid' : undefined,
                borderLeftColor:
                    doubleElevationHoverBackground[theme.palette.mode],
            }}
            onClick={handleClick}
        >
            <LogsTableColumns
                row={row}
                open={open}
                heightChanging={heightChanging}
                sizeRef={sizeRef}
            />
        </TableRow>
    );
}
