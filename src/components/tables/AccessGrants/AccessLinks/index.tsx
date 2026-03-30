import type { TableColumns, TableState } from 'src/types';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
    Box,
    Table,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { CombinedError } from 'urql';

import { useInviteLinks } from 'src/api/gql/inviteLinks';
import { Row } from 'src/components/tables/AccessGrants/AccessLinks/Row';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useCursorPagination } from 'src/hooks/useCursorPagination';
import { TableStatuses } from 'src/types';

export interface InviteErrorProps {
    setError: Dispatch<SetStateAction<CombinedError | null>>;
}

const columns: TableColumns[] = [
    {
        field: 'catalogPrefix',
        headerIntlKey: 'accessGrants.table.accessLinks.label.prefix',
    },
    {
        field: 'capability',
        headerIntlKey: 'accessGrants.table.accessLinks.label.capability',
    },
    {
        field: 'singleUse',
        headerIntlKey: 'accessGrants.table.accessLinks.label.type',
    },
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'createdAt',
        headerIntlKey: 'accessGrants.table.accessLinks.label.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: '',
    },
];

export function AccessLinksTable({ setError }: InviteErrorProps) {
    const intl = useIntl();

    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const { inviteLinks, fetching, error, pageInfo, pageSize } =
        useInviteLinks(cursor);

    const handlePageChange = (_event: any, page: number) => {
        onPageChange(_event, page, pageInfo?.endCursor);
    };

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (fetching) {
            setTableState({ status: TableStatuses.LOADING });
            return;
        }

        if (error) {
            setError(() => error);
            if (error.networkError) {
                setTableState({ status: TableStatuses.NETWORK_FAILED });
            } else {
                setTableState({ status: TableStatuses.TECHNICAL_DIFFICULTIES });
            }
            return;
        }

        if (inviteLinks.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
            return;
        }

        // If current page is empty but we're not on page 1,
        // go back a page (e.g. after deleting the last item on a page)
        if (currentPage > 0) {
            goToPage(currentPage - 1);
            return;
        }

        setTableState({ status: TableStatuses.NO_EXISTING_DATA });
    }, [fetching, error, inviteLinks, currentPage, goToPage, setError]);

    const hasData = Boolean(pageInfo);

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {intl.formatMessage({
                    id: 'accessGrants.table.accessLinks.title',
                })}
            </Typography>
            <TableContainer>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'accessGrants.table.accessLinks.title',
                    })}
                >
                    <EntityTableHeader columns={columns} />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'accessGrants.table.accessLinks.header.noData',
                            message:
                                'accessGrants.table.accessLinks.message.noData',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={fetching}
                        rows={
                            hasData && inviteLinks.length > 0 ? (
                                <>
                                    {inviteLinks.map((link) => (
                                        <Row
                                            key={link.token}
                                            row={link}
                                            setError={setError}
                                        />
                                    ))}
                                </>
                            ) : null
                        }
                    />
                    {hasData ? (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={-1}
                                    page={currentPage}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={[
                                        // one value here overrides the default options and hides the rows-per-page selector
                                        pageSize,
                                    ]}
                                    onPageChange={handlePageChange}
                                    labelDisplayedRows={({ from }) => {
                                        const to =
                                            from + inviteLinks.length - 1;
                                        return `${from}–${to}`;
                                    }}
                                    slotProps={{
                                        actions: {
                                            previousButton: {
                                                disabled:
                                                    !pageInfo?.hasPreviousPage,
                                            },
                                            nextButton: {
                                                disabled:
                                                    !pageInfo?.hasNextPage,
                                            },
                                        },
                                    }}
                                />
                            </TableRow>
                        </TableFooter>
                    ) : null}
                </Table>
            </TableContainer>
        </Box>
    );
}
