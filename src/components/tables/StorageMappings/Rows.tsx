import type {
    DataPlaneCellsProps,
    RowProps,
    RowsProps,
} from 'src/components/tables/StorageMappings/types';

import { TableCell, TableRow, useTheme } from '@mui/material';

import { useSearchParams } from 'react-router-dom';

import ChipListCell from 'src/components/tables/cells/ChipList';
import ChipStatus from 'src/components/tables/cells/ChipStatus';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

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

function Row({ row, rowSx, onRowClick }: RowProps) {
    const key = `StorageMappings-${row.id}-stores-`;

    return (
        <>
            {row.spec.stores.map((store, index) =>
                index === 0 ? (
                    <TableRow
                        hover
                        key={`${key}${index}`}
                        sx={rowSx}
                        onClick={() => onRowClick(row)}
                    >
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
                    <TableRow
                        hover
                        key={`${key}${index}`}
                        sx={rowSx}
                        onClick={() => onRowClick(row)}
                    >
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
    const theme = useTheme();

    const [, setSearchParams] = useSearchParams();

    const handleRowClick = (row: (typeof data)[0]) => {
        setSearchParams((prev) => {
            prev.set(GlobalSearchParams.SM_DIALOG, 'edit');
            prev.set(GlobalSearchParams.SM_PREFIX, row.catalog_prefix);
            return prev;
        });
    };

    return (
        <>
            {data.map((row) => (
                <Row
                    row={row}
                    key={row.id}
                    rowSx={getEntityTableRowSx(theme)}
                    onRowClick={handleRowClick}
                />
            ))}
        </>
    );
}

export default Rows;
