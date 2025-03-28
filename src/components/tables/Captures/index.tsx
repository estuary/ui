import { useMemo } from 'react';

import { Box } from '@mui/material';

import { selectKeyValueName } from '../shared';
import CaptureExportButton from './Export';
import useCaptureColumns from './useCaptureColumns';

import { getLiveSpecs_captures } from 'src/api/liveSpecsExt';
import Rows from 'src/components/tables/Captures/Rows';
import EntityTable from 'src/components/tables/EntityTable';
import RowSelector from 'src/components/tables/RowActions/RowSelector';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { SelectTableStoreNames } from 'src/stores/names';
import { useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import StatsHydrator from 'src/stores/Tables/StatsHydrator';

const selectableTableStoreName = SelectTableStoreNames.CAPTURE;

function CapturesTable() {
    const {
        pagination,
        setPagination,
        rowsPerPage,
        setRowsPerPage,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('cap', 'updated_at', 'desc');
    const tableColumns = useCaptureColumns();

    const query = useMemo(() => {
        return getLiveSpecs_captures(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={selectableTableStoreName}
            >
                <StatsHydrator
                    selectableTableStoreName={selectableTableStoreName}
                >
                    <EntityTable
                        ExportComponent={CaptureExportButton}
                        noExistingDataContentIds={
                            ENTITY_SETTINGS.capture.table
                                .noExistingDataContentIds
                        }
                        columns={tableColumns}
                        renderTableRows={(data, showEntityStatus) => (
                            <Rows
                                data={data}
                                showEntityStatus={showEntityStatus}
                            />
                        )}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        pagination={pagination}
                        setPagination={setPagination}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        columnToSort={columnToSort}
                        setColumnToSort={setColumnToSort}
                        header={ENTITY_SETTINGS.capture.table.headerIntlKey}
                        filterLabel={
                            ENTITY_SETTINGS.capture.table.filterIntlKey
                        }
                        showEntityStatus
                        selectableTableStoreName={selectableTableStoreName}
                        showToolbar
                        toolbar={
                            <RowSelector
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                                selectKeyValueName={selectKeyValueName}
                                showMaterialize={true}
                            />
                        }
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default CapturesTable;
