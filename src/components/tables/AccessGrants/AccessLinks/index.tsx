import type { InviteErrorProps } from 'src/components/tables/AccessGrants/AccessLinks/Dialog';
import type { InviteLink } from 'src/gql-types/graphql';
import type { TableColumns, TableState } from 'src/types';

import { useEffect, useState } from 'react';

import {
    Box,
    IconButton,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { Trash } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useDeleteInviteLink, useInviteLinks } from 'src/api/gql/inviteLinks';
import CopyAccessLink from 'src/components/tables/cells/CopyAccessLink';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { TableStatuses } from 'src/types';

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

function Row({
    row,
    setError,
}: InviteErrorProps & {
    row: InviteLink;
}) {
    const intl = useIntl();
    const [{ fetching }, deleteInviteLink] = useDeleteInviteLink();

    const handleDelete = async () => {
        const result = await deleteInviteLink({ token: row.token });

        setError(result.error ?? null);
    };

    return (
        <TableRow hover>
            <TableCell>
                <Typography>{row.catalogPrefix}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.capability}</Typography>
            </TableCell>

            <TableCell>
                <Typography>
                    {intl.formatMessage({
                        id: row.singleUse
                            ? 'accessGrants.table.accessLinks.label.type.singleUse'
                            : 'accessGrants.table.accessLinks.label.type.multiUse',
                    })}
                </Typography>
            </TableCell>

            <CopyAccessLink token={row.token} />

            <TimeStamp time={row.createdAt} />

            <TableCell sx={{ width: 50 }}>
                <IconButton
                    onClick={handleDelete}
                    disabled={fetching}
                    size="small"
                    sx={{ color: 'error.main' }}
                    aria-label={intl.formatMessage({ id: 'cta.delete' })}
                >
                    <Trash />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}

export function AccessLinksTable({ setError }: InviteErrorProps) {
    const intl = useIntl();

    const [currentPage, setCurrentPage] = useState(0);
    const [afterCursor, setAfterCursor] = useState<string | undefined>(
        undefined
    );
    const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>(
        []
    );

    const { inviteLinks, fetching, error, pageInfo, pageSize } =
        useInviteLinks(afterCursor);

    const handlePageChange = (_event: any, page: number) => {
        if (page > currentPage) {
            const endCursor = pageInfo?.endCursor;

            if (endCursor) {
                setAfterCursor(endCursor);
                setCursorHistory((prev) => [...prev, endCursor]);
            }
        } else if (page < currentPage) {
            if (page === 0) {
                setAfterCursor(undefined);
                setCursorHistory([]);
            } else {
                setAfterCursor(cursorHistory[page]);
            }
        }
        setCurrentPage(page);
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
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            setAfterCursor(
                prevPage === 0 ? undefined : cursorHistory[prevPage]
            );
            setCursorHistory((prev) => prev.slice(0, prevPage + 1));
            return;
        }

        setTableState({ status: TableStatuses.NO_EXISTING_DATA });
    }, [fetching, error, inviteLinks, currentPage, cursorHistory]);

    const hasData = Boolean(pageInfo);

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {intl.formatMessage({
                    id: 'accessGrants.table.accessLinks.title',
                })}
            </Typography>
            <TableContainer component={Box}>
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
                                                disabled: currentPage === 0,
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
