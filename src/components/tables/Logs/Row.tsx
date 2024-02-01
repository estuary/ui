import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { defaultOutline_hovered } from 'context/Theme';
import { DEFAULT_ROW_HEIGHT } from './shared';
import { LogsTableColumns } from './Columns';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    rowOpened: (isOpen: boolean) => void;
    renderOpen?: boolean;
    style?: CSSProperties;
}

export function LogsTableRow({
    row,
    rowExpanded,
    renderOpen = false,
    rowOpened,
    style,
}: RowProps) {
    // const startOfLogs = row._meta.uuid === START_OF_LOGS_UUID;

    const theme = useTheme();
    const renderedHeight = style?.height ?? DEFAULT_ROW_HEIGHT;

    const previousHeight = useRef(renderedHeight);
    const [open, setOpen] = useState(renderOpen);
    const [heightChanging, setHeightChanging] = useState(false);

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
        rowOpened(newVal);
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
                borderLeft: open ? '3px solid' : undefined,
                borderLeftColor: defaultOutline_hovered[theme.palette.mode],
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
