import type { CSSProperties } from 'react';
import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { Box, TableCell, TableRow, Tooltip, Typography } from '@mui/material';

import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import ChipList from 'src/components/shared/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import {
    ACTIONS_TABLE_COLUMN_WIDTH,
    baseVirtualizedTableCell,
    EXPANDING_TABLE_COLUMN_WIDTH,
    TABLE_ROW_HEIGHT,
} from 'src/components/tables/PrefixAlerts/shared';
import { truncateTextSx } from 'src/context/Theme';
import { UNDERSCORE_RE } from 'src/validation';

function Row({ executeQuery, height, row }: RowProps) {
    const expandingVirtualizedTableCell: CSSProperties = {
        ...baseVirtualizedTableCell,
        flex: '1 0',
        height,
        width: EXPANDING_TABLE_COLUMN_WIDTH,
    };

    return (
        <TableRow
            component={Box}
            style={{
                alignItems: 'center',
                display: 'flex',
            }}
        >
            <TableCell
                component={Box}
                style={expandingVirtualizedTableCell}
                sx={truncateTextSx}
            >
                <Tooltip placement="bottom-start" title={row.catalogPrefix}>
                    <Typography
                        component={Box}
                        style={{ cursor: 'default' }}
                        sx={truncateTextSx}
                    >
                        {row.catalogPrefix}
                    </Typography>
                </Tooltip>
            </TableCell>

            {/* The combination of the customized alignment and padding in this cell
                is used to mock centered cell contain while maintaining the ability
                to scroll the ChipList content. */}
            <TableCell
                component={Box}
                style={{
                    ...expandingVirtualizedTableCell,
                    alignItems: 'flex-start',
                    overflow: 'auto',
                    paddingTop: 10,
                }}
            >
                <ChipList
                    values={row.alertTypes
                        .map((value) => value.replace(UNDERSCORE_RE, ' '))
                        .sort()}
                    stripPath={false}
                    maxChips={1}
                />
            </TableCell>

            <TableCell component={Box} style={expandingVirtualizedTableCell}>
                <Tooltip placement="bottom-start" title={row.email}>
                    <Typography
                        component={Box}
                        style={{ cursor: 'default' }}
                        sx={truncateTextSx}
                    >
                        {row.email}
                    </Typography>
                </Tooltip>
            </TableCell>

            <AlertEditButton
                alertTypes={row.alertTypes}
                email={row.email}
                executeQuery={executeQuery}
                prefix={row.catalogPrefix}
                component={Box}
                style={{
                    ...baseVirtualizedTableCell,
                    height,
                    width: ACTIONS_TABLE_COLUMN_WIDTH,
                }}
            />
        </TableRow>
    );
}

function Rows({ data, executeQuery }: RowsProps) {
    return (
        <AutoSizer>
            {({ height, width }: AutoSizer['state']) => {
                return (
                    <FixedSizeList
                        height={
                            height < TABLE_ROW_HEIGHT
                                ? TABLE_ROW_HEIGHT
                                : height
                        }
                        itemCount={data.length}
                        itemData={data}
                        itemSize={TABLE_ROW_HEIGHT}
                        width={width}
                    >
                        {({ data: listData, index }) => {
                            const row = listData[index];

                            return (
                                <Row
                                    executeQuery={executeQuery}
                                    height={TABLE_ROW_HEIGHT}
                                    key={`${row.catalogPrefix}-${row.email}`}
                                    row={row}
                                />
                            );
                        }}
                    </FixedSizeList>
                );
            }}
        </AutoSizer>
    );
}

export default Rows;
