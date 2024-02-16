import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { defaultOutline_hovered } from 'context/Theme';
import { UUID_NEWEST_LOG, UUID_OLDEST_LOG } from './shared';
import { LogsTableColumns } from './Columns';
import WaitingForOldLogsRow from './WaitingForRow/OldLogs';
import WaitingForNewLogsRow from './WaitingForRow/NewLogs';

interface RowProps {
    row: OpsLogFlowDocument;
    rowExpanded: (uuid: string, height: number) => void;
    rowOpened: (uuid: string, isOpen: boolean) => void;
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

    const uuid = useRef(row._meta.uuid);
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
        rowExpanded(uuid.current, rowSizeHeight);
        setHeightChanging(false);
    }, [rowExpanded, rowSizeHeight]);

    const handleClick = () => {
        const newVal = !open;

        setHeightChanging(true);
        setOpen(newVal);
        rowOpened(uuid.current, newVal);
    };

    const WaitingComponent =
        uuid.current === UUID_NEWEST_LOG
            ? WaitingForNewLogsRow
            : uuid.current === UUID_OLDEST_LOG
            ? WaitingForOldLogsRow
            : null;

    if (WaitingComponent) {
        return <WaitingComponent style={style} sizeRef={sizeRef} />;
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
                overflow: 'hidden',
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
