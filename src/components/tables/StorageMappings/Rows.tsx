import type { StorageMappings, StorageMappingStore } from 'src/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import ChipStatus from 'src/components/tables/cells/ChipStatus';
import TimeStamp from 'src/components/tables/cells/TimeStamp';

interface RowProps {
    row: StorageMappings;
}

interface RowsProps {
    data: StorageMappings[];
}

interface DataCellProps {
    store: StorageMappingStore;
}

export const tableColumns = [
    {
        field: 'catalog_prefix',
        headerIntlKey: 'entityTable.data.catalogPrefix',
    },
    {
        field: null,
        headerIntlKey: 'data.status',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.dataPlanes',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.provider',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.bucket',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.storagePrefix',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function DataCells({ store }: DataCellProps) {
    const { provider, bucket, prefix, data_planes } = store;
    return (
        <>
            <ChipListCell values={data_planes} maxChips={3} stripPath={false} />

            <TableCell>{provider}</TableCell>

            <TableCell>{bucket}</TableCell>

            <TableCell>{prefix}</TableCell>
        </>
    );
}

function Row({ row }: RowProps) {
    const key = `StorageMappings-${row.id}-stores-`;

    return (
        <>
            {row.spec.stores.map((store, index) =>
                index === 0 ? (
                    <TableRow key={`${key}${index}`}>
                        <TableCell>{row.catalog_prefix}</TableCell>
                        <ChipStatus
                            color="success"
                            messageId="storageMappings.status.active"
                        />
                        <DataCells store={store} />
                        <TimeStamp time={row.updated_at} enableRelative />
                    </TableRow>
                ) : (
                    <TableRow key={`${key}${index}`}>
                        <TableCell />
                        <TableCell />
                        <DataCells store={store} />
                        <TableCell />
                    </TableRow>
                )
            )}
        </>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row row={row} key={row.id} />
            ))}
        </>
    );
}

export default Rows;
