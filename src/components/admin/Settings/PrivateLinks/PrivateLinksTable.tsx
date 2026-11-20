import type { PrivateLinkDataPlane } from 'src/components/admin/Settings/PrivateLinks/PrivateDataPlane';
import type { PrivateLinkProvisioningStatus } from 'src/gql-types/graphql';

import { useState } from 'react';

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography,
} from '@mui/material';

import { orderBy } from 'lodash';

import { compactTableSx } from 'src/components/admin/Settings/DataPlanes/compactTableSx';
import {
    PrivateLinkStatus,
    privateLinkStatuses,
} from 'src/components/admin/Settings/PrivateLinks/PrivateLinkStatus';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import SearchField from 'src/components/shared/toolbar/SearchField';
import TablePaginationActions from 'src/components/tables/PaginationActions';
import {
    getPrivateLinkConfiguration,
    getPrivateLinkEndpoint,
} from 'src/utils/private-link-utils';

const PAGE_SIZE = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

interface PrivateLinksTableProps {
    plane: PrivateLinkDataPlane;
    onOpen: (id: string) => void;
}

export function PrivateLinksTable({ plane, onOpen }: PrivateLinksTableProps) {
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [requestedPage, setRequestedPage] = useState(0);

    const rows = plane.privateLinks.map((link) => {
        const name = link.detail?.trim() || 'Unnamed private link';
        const createdAt = new Date(link.createdAt);
        const createdLabel = dateFormat.format(createdAt);
        const endpoint = getPrivateLinkEndpoint(
            link.config,
            link.status === 'PROVISIONED' ? link.details : null
        );
        return { link, name, createdAt, createdLabel, endpoint };
    });
    const matches = rows.filter(
        ({ link, name, createdLabel, endpoint }) =>
            !search ||
            includesValue(
                [
                    link,
                    name,
                    createdLabel,
                    plane.displayName,
                    privateLinkStatuses[link.status].label,
                    getPrivateLinkConfiguration(link.config).map(
                        ({ value }) => value
                    ),
                    endpoint.addresses.map(({ value }) => value),
                ],
                search
            )
    );
    // PostgreSQL can distinguish links created within the same millisecond.
    const sorted = orderBy(
        matches,
        [
            ({ createdAt }) => createdAt,
            ({ link }) => link.createdAt.match(/\.(\d+)/)?.[1] ?? '',
        ],
        [order, order]
    );
    const lastPage = Math.max(0, Math.ceil(sorted.length / PAGE_SIZE) - 1);
    const page = Math.min(requestedPage, lastPage);
    const start = page * PAGE_SIZE;

    return (
        <>
            <Box sx={{ p: 1.5 }}>
                <SearchField
                    label="Search private links"
                    changeHandler={(event) => {
                        setSearch(event.target.value.trim().toLowerCase());
                        setRequestedPage(0);
                    }}
                />
            </Box>
            <TableContainer>
                <Table
                    size="small"
                    aria-label="Private links"
                    sx={[
                        compactTableSx,
                        {
                            'tableLayout': 'fixed',
                            'minWidth': 540,
                            '& th:first-of-type': { width: '27%' },
                            '& th:last-of-type': { width: '26%' },
                        },
                    ]}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell scope="col">Name</TableCell>
                            <TableCell scope="col">Endpoint address</TableCell>
                            <TableCell scope="col" sortDirection={order}>
                                <TableSortLabel
                                    active
                                    direction={order}
                                    onClick={() => {
                                        setOrder(
                                            order === 'desc' ? 'asc' : 'desc'
                                        );
                                        setRequestedPage(0);
                                    }}
                                >
                                    Created at
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted
                            .slice(start, start + PAGE_SIZE)
                            .map(({ link, name, createdLabel, endpoint }) => (
                                <TableRow
                                    key={link.id}
                                    hover
                                    tabIndex={0}
                                    aria-label={`Details for ${name}`}
                                    aria-haspopup="dialog"
                                    sx={{
                                        'cursor': 'pointer',
                                        '&:focus-visible': {
                                            outline: '2px solid',
                                            outlineColor: 'primary.main',
                                            outlineOffset: -2,
                                        },
                                    }}
                                    onClick={({ target }) => {
                                        if (
                                            target instanceof Element &&
                                            !target.closest('button')
                                        ) {
                                            onOpen(link.id);
                                        }
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.target ===
                                                event.currentTarget &&
                                            (event.key === 'Enter' ||
                                                event.key === ' ')
                                        ) {
                                            event.preventDefault();
                                            onOpen(link.id);
                                        }
                                    }}
                                >
                                    <TableCell
                                        sx={{ overflowWrap: 'anywhere' }}
                                    >
                                        {name}
                                    </TableCell>
                                    <TableCell>
                                        <Address
                                            name={name}
                                            endpoint={endpoint}
                                            status={link.status}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <time
                                            dateTime={link.createdAt}
                                            title={link.createdAt}
                                        >
                                            {createdLabel}
                                        </time>
                                    </TableCell>
                                </TableRow>
                            ))}
                        {sorted.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <Typography
                                        variant="body2"
                                        component="output"
                                    >
                                        No private links match your search.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </TableContainer>
            {lastPage > 0 ? (
                <nav aria-label="private links pagination">
                    <TablePagination
                        component="div"
                        ActionsComponent={TablePaginationActions}
                        count={sorted.length}
                        rowsPerPage={PAGE_SIZE}
                        rowsPerPageOptions={[PAGE_SIZE]}
                        page={page}
                        onPageChange={(_event, nextPage) =>
                            setRequestedPage(nextPage)
                        }
                    />
                </nav>
            ) : null}
        </>
    );
}

function includesValue(value: unknown, search: string): boolean {
    if (value == null) {
        return false;
    }
    if (typeof value === 'object') {
        return Object.values(value).some((child) =>
            includesValue(child, search)
        );
    }
    return String(value).toLowerCase().includes(search);
}

function Address({
    name,
    endpoint,
    status,
}: {
    name: string;
    endpoint: ReturnType<typeof getPrivateLinkEndpoint>;
    status: PrivateLinkProvisioningStatus;
}) {
    if (status !== 'PROVISIONED') {
        return <PrivateLinkStatus status={status} />;
    }

    const address = endpoint.addresses[0];
    if (!address) {
        return '—';
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
                component="code"
                variant="caption"
                noWrap
                title={address.value}
                sx={{ fontFamily: 'monospace', minWidth: 0 }}
            >
                {address.value}
            </Typography>
            <CopyToClipboardButton
                label={`Copy ${address.label} for ${name}`}
                writeValue={address.value}
            />
        </Box>
    );
}
