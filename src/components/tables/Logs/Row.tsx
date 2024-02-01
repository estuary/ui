import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { defaultOutline_hovered } from 'context/Theme';
import { UUID_NEWEST_LOG, UUID_START_OF_LOGS } from './shared';
import { LogsTableColumns } from './Columns';
import WaitingForOldLogsRow from './WaitingForRow/OldLogs';
import WaitingForNewLogsRow from './WaitingForRow/NewLogs';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (height: number) => void;
    rowOpened: (isOpen: boolean) => void;
    style: CSSProperties;
    renderOpen?: boolean;
}

export function LogsTableRow({
    row,
    rowExpanded,
    renderOpen = false,
    rowOpened,
    style,
}: RowProps) {
    const theme = useTheme();
    const renderedHeight = style.height;

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

    if (row._meta.uuid === UUID_NEWEST_LOG) {
        return <WaitingForNewLogsRow style={style} sizeRef={sizeRef} />;
    }

    if (row._meta.uuid === UUID_START_OF_LOGS) {
        return <WaitingForOldLogsRow style={style} />;
    }

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
