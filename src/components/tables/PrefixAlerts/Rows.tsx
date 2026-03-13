import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { Box, TableCell, TableRow } from '@mui/material';

import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import ChipList from 'src/components/shared/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { UNDERSCORE_RE } from 'src/validation';

function Row({ executeQuery, height, row }: RowProps) {
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
                style={{
                    alignItems: 'inherit',
                    display: 'inline-flex',
                    flexGrow: 1,
                    flexShrink: 0,
                    height,
                    width: 250,
                }}
            >
                {row.catalogPrefix}
            </TableCell>

            <TableCell
                component={Box}
                style={{
                    alignItems: 'inherit',
                    display: 'inline-flex',
                    flexGrow: 1,
                    flexShrink: 0,
                    height,
                    width: 250,
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

            <TableCell
                component={Box}
                style={{
                    alignItems: 'inherit',
                    display: 'inline-flex',
                    flexGrow: 1,
                    flexShrink: 0,
                    height,
                    width: 250,
                }}
            >
                {row.email}
            </TableCell>

            <AlertEditButton
                alertTypes={row.alertTypes}
                email={row.email}
                executeQuery={executeQuery}
                prefix={row.catalogPrefix}
                component={Box}
                style={{
                    alignItems: 'inherit',
                    display: 'inline-flex',
                    height,
                    width: 'fit-content',
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
                        height={height < 50 ? 50 : height}
                        itemCount={data.length}
                        itemData={data}
                        itemSize={50}
                        width={width}
                    >
                        {({ data: listData, index }) => {
                            const row = listData[index];

                            return (
                                <Row
                                    executeQuery={executeQuery}
                                    height={50}
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
