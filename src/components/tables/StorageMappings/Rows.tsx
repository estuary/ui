import type {
    DataPlaneCellsProps,
    RowProps,
    RowsProps,
} from 'src/components/tables/StorageMappings/types';
import type { StorageMappingsQuery } from 'src/types';

import { useState } from 'react';

import { TableCell, TableRow, useTheme } from '@mui/material';

import { storageProviderToCloudProvider } from 'src/api/storageMappingsGql';
import { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import StorageMappingDialog from 'src/components/admin/Settings/StorageMappings/Dialog/Update';
import ChipListCell from 'src/components/tables/cells/ChipList';
import ChipStatus from 'src/components/tables/cells/ChipStatus';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';

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

    const [selectedRow, setSelectedRow] = useState<StorageMappingsQuery | null>(
        null
    );

    const handleRowClick = (row: StorageMappingsQuery) => {
        setSelectedRow(row);
    };

    const handleCloseDialog = () => {
        setSelectedRow(null);
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
            {selectedRow ? (
                <StorageMappingDialog
                    // TODO (GREG): fix typing here... or fetch storage mappings from gql api and rebuild the tables...
                    mapping={{
                        catalog_prefix: selectedRow.catalog_prefix,
                        spec: {
                            data_planes: selectedRow.spec.data_planes,
                            stores: selectedRow.spec.stores.map((store) => ({
                                bucket: store.bucket,
                                provider: storageProviderToCloudProvider(
                                    store.provider as CloudProvider
                                ),
                                storage_prefix: store.prefix,
                            })),
                        },
                    }}
                    onClose={handleCloseDialog}
                />
            ) : null}
        </>
    );
}

export default Rows;
