import type {
    DataPlaneCellsProps,
    RowProps,
    RowsProps,
} from 'src/components/tables/StorageMappings/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import ChipStatus from 'src/components/tables/cells/ChipStatus';
import TimeStamp from 'src/components/tables/cells/TimeStamp';

function DataPlaneCells({ dataPlanes, store }: DataPlaneCellsProps) {
    const { provider, bucket, prefix } = store;

    return (
        <>
            <ChipListCell
                values={dataPlanes ?? []}
                maxChips={3}
                stripPath={false}
            />

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

                        <DataPlaneCells
                            store={store}
                            dataPlanes={row.spec.data_planes}
                        />

                        <TimeStamp time={row.updated_at} enableRelative />
                    </TableRow>
                ) : (
                    <TableRow key={`${key}${index}`}>
                        <TableCell />

                        <TableCell />

                        <DataPlaneCells
                            store={store}
                            dataPlanes={row.spec.data_planes}
                        />

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
