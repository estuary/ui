import { TableCell, TableRow } from '@mui/material';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { StorageMappings, StorageMappingStore } from 'types';

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
        headerIntlKey: 'entityTable.data.provider',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.bucket',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.prefix',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function DataCells({ store }: DataCellProps) {
    const { provider, bucket, prefix } = store;
    return (
        <>
            <TableCell>{provider}</TableCell>

            <TableCell>{bucket}</TableCell>

            <TableCell>{prefix}</TableCell>
        </>
    );
}

function Row({ row }: RowProps) {
    const key = `StorageMappings-${row.id}`;
    const multipleStores = row.spec.stores.length > 1;

    if (multipleStores) {
        return (
            <>
                <TableRow key={key}>
                    <TableCell colSpan={4}>{row.catalog_prefix}</TableCell>
                    <TimeStamp time={row.updated_at} enableRelative />
                </TableRow>
                {row.spec.stores.map((store) => (
                    <TableRow key={key}>
                        <TableCell />
                        <DataCells store={store} />
                        <TableCell />
                    </TableRow>
                ))}
            </>
        );
    }

    return (
        <TableRow key={key}>
            <TableCell>{row.catalog_prefix}</TableCell>
            <DataCells store={row.spec.stores[0]} />
            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
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
