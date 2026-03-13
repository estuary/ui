import type { InviteLink } from 'src/gql-types/graphql';
import type { TableColumns, TableState } from 'src/types';

import { useEffect, useState } from 'react';

import {
    Box,
    Table,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';

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
        headerIntlKey:
            'accessGrants.table.accessLinks.label.provisioningPrefix',
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
        field: 'createdAt',
        headerIntlKey: 'accessGrants.table.accessLinks.label.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: null,
        headerIntlKey: '',
    },
];

interface AccessLinksTableProps {
    catalogPrefix: string;
    refreshKey: number;
}

function Row({ row, onDeleted }: { row: InviteLink; onDeleted: () => void }) {
    const intl = useIntl();
    const [, deleteInviteLink] = useDeleteInviteLink();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        const result = await deleteInviteLink({ token: row.token });
        setDeleting(false);

        if (!result.error) {
            onDeleted();
        }
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

            <TimeStamp time={row.createdAt} />

            <CopyAccessLink token={row.token} />

            <TableCell sx={{ width: 80 }}>
                <Typography
                    component="button"
                    onClick={handleDelete}
                    sx={{
                        cursor: 'pointer',
                        color: 'error.main',
                        border: 'none',
                        background: 'none',
                        fontSize: 'inherit',
                        opacity: deleting ? 0.5 : 1,
                        pointerEvents: deleting ? 'none' : 'auto',
                    }}
                >
                    {intl.formatMessage({ id: 'cta.delete' })}
                </Typography>
            </TableCell>
        </TableRow>
    );
}

function AccessLinksTable({
    catalogPrefix,
    refreshKey,
}: AccessLinksTableProps) {
    const intl = useIntl();

    const { inviteLinks, fetching, error, refetch } = useInviteLinks(
        catalogPrefix,
        refreshKey
    );

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

        setTableState({ status: TableStatuses.NO_EXISTING_DATA });
    }, [fetching, error, inviteLinks]);

    const failed =
        tableState.status === TableStatuses.TECHNICAL_DIFFICULTIES ||
        tableState.status === TableStatuses.NETWORK_FAILED;
    const loading = tableState.status === TableStatuses.LOADING;
    const hasData =
        !failed && !loading && tableState.status === TableStatuses.DATA_FETCHED;

    const handleDeleted = refetch;

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
                    <EntityTableHeader columns={columns} selectData={true} />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'accessGrants.table.accessLinks.header.noData',
                            message:
                                'accessGrants.table.accessLinks.message.noData',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={loading}
                        rows={
                            hasData && inviteLinks.length > 0 ? (
                                <>
                                    {inviteLinks.map((link) => (
                                        <Row
                                            key={link.token}
                                            row={link}
                                            onDeleted={handleDeleted}
                                        />
                                    ))}
                                </>
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AccessLinksTable;
