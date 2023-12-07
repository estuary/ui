import { Box, Table, TableContainer } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import Rows from 'components/tables/FieldSelection/Rows';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { SortDirection, TableColumns, TableState, TableStatuses } from 'types';

interface Props {
    projections: CompositeProjection[] | null | undefined;
}

export const columns: TableColumns[] = [
    {
        field: 'field',
        headerIntlKey: 'data.field',
        sticky: true,
    },
    {
        field: 'ptr',
        headerIntlKey: 'data.pointer',
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
    {
        field: 'constraint.type',
        headerIntlKey: 'fieldSelection.table.label.details',
    },
    {
        field: null,
        headerIntlKey: 'fieldSelection.table.label.actions',
    },
];

function FieldSelectionTable({ projections }: Props) {
    const intl = useIntl();

    const formStatus = useFormStateStore_status();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState('constraint.type');

    const handlers = {
        sortRequest: (_event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: any) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
    };

    useEffect(() => {
        if (
            formStatus !== FormStatus.FAILED &&
            (typeof projections === 'undefined' ||
                projections === null ||
                formStatus === FormStatus.GENERATING ||
                formStatus === FormStatus.TESTING ||
                formStatus === FormStatus.TESTING_BACKGROUND)
        ) {
            setTableState({ status: TableStatuses.LOADING });
        } else {
            setTableState({
                status:
                    projections && projections.length > 0
                        ? TableStatuses.DATA_FETCHED
                        : TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [setTableState, formStatus, projections]);

    return (
        <Box>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'entityTable.title',
                    })}
                >
                    <EntityTableHeader
                        columns={columns}
                        columnToSort={columnToSort}
                        sortDirection={sortDirection}
                        headerClick={handlers.sort}
                        selectData={true}
                    />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'fieldSelection.table.empty.header',
                            message:
                                formStatus === FormStatus.FAILED
                                    ? 'fieldSelection.table.error.message'
                                    : 'fieldSelection.table.empty.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={tableState.status === TableStatuses.LOADING}
                        rows={
                            tableState.status !== TableStatuses.LOADING &&
                            projections &&
                            projections.length > 0 &&
                            formStatus !== FormStatus.TESTING ? (
                                <Rows
                                    data={projections}
                                    sortDirection={sortDirection}
                                    columnToSort={columnToSort}
                                />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default FieldSelectionTable;
