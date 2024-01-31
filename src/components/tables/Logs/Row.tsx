import { Box, TableRow, useTheme } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import { useRef, useState } from 'react';
import { doubleElevationHoverBackground } from 'context/Theme';
import useResizeObserver from 'use-resize-observer';
import { useDebounce } from 'react-use';
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
    const [heightChanging, setHeightChanging] = useState(false);
    const previousHeight = useRef<Number>(renderedHeight);

    const { ref: sizeRef, height: rowSizeHeight } =
        useResizeObserver<HTMLElement>();

    const [, cancel] = useDebounce(
        () => {
            if (!rowSizeHeight || rowSizeHeight === previousHeight.current) {
                return;
            }

            previousHeight.current = rowSizeHeight;
            rowExpanded(rowSizeHeight);
            setHeightChanging(false);
        },
        10,
        [rowSizeHeight, rowExpanded, setHeightChanging]
    );

    const handleClick = () => {
        const newVal = !open;

        setHeightChanging(true);
        setOpen(newVal);

        if (!newVal) {
            cancel();
        }
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
                heightChanging={heightChanging}
                sizeRef={sizeRef}
            />
        </TableRow>
    );
}
