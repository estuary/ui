import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type { PrivateLink } from 'src/utils/private-link-utils';

import {
    Box,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';

import { PrivateLinkStatus } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkStatus';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import TableLoadingRows from 'src/components/tables/Loading';
import { getEntityTableRowSx } from 'src/context/Theme';
import {
    getLinkAddress,
    getLinkEndpoint,
    getLinkProvider,
    getLinkServiceLabel,
    PRIVATE_LINK_LABELS,
} from 'src/utils/private-link-utils';

export interface PrivateLinkRow {
    dataPlane: PrivateLinkDataPlane;
    link: PrivateLink;
}

interface PrivateLinksTableProps {
    rows: PrivateLinkRow[];
    loading: boolean;
    onOpen: (row: PrivateLinkRow) => void;
}

// The widths are fixed so that long service names and addresses truncate
// instead of stretching the table.
const columns = [
    { field: 'service', header: 'Service', width: '30%' },
    { field: 'dataPlane', header: 'Data plane', width: '18%' },
    { field: 'status', header: 'Status', width: '14%' },
    { field: 'address', header: 'Address', width: '38%' },
];

const monospaceSx = { fontFamily: 'monospace', fontSize: 13 };

function Address({ link }: { link: PrivateLink }) {
    if (link.status === 'FAILED') {
        return (
            <Typography noWrap title={link.error ?? undefined} color="error">
                {link.error ?? 'No reason given'}
            </Typography>
        );
    }

    const endpoint =
        link.status === 'PROVISIONED'
            ? getLinkEndpoint(link.config, link.details)
            : null;
    const address = endpoint ? getLinkAddress(endpoint) : null;

    if (!address) {
        return <Typography sx={{ color: 'text.secondary' }}>-</Typography>;
    }

    return (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography noWrap title={address} sx={monospaceSx}>
                {address}
            </Typography>
            {/* Copying an address shouldn't also open the row. */}
            <Box onClick={(event) => event.stopPropagation()}>
                <CopyToClipboardButton
                    label="Copy address"
                    writeValue={address}
                />
            </Box>
        </Stack>
    );
}

export function PrivateLinksTable({
    rows,
    loading,
    onOpen,
}: PrivateLinksTableProps) {
    const theme = useTheme();

    return (
        <TableContainer>
            <Table
                size="small"
                aria-label="Private links"
                sx={{ minWidth: 650, tableLayout: 'fixed' }}
            >
                <TableHead>
                    <TableRow
                        sx={{ background: theme.palette.background.default }}
                    >
                        {columns.map((column) => (
                            <TableCell key={column.field} width={column.width}>
                                {column.header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        <TableLoadingRows
                            columnKeys={columns.map(({ field }) => field)}
                        />
                    ) : (
                        rows.map((row) => {
                            const { config, id, status } = row.link;
                            const provider = getLinkProvider(config);
                            const crossRegion =
                                config.__typename === 'AWSPrivateLink' &&
                                config.serviceRegion &&
                                config.serviceRegion !== config.region
                                    ? `, cross-region from ${config.serviceRegion}`
                                    : '';

                            return (
                                <TableRow
                                    key={id}
                                    hover
                                    onClick={() => onOpen(row)}
                                    sx={{
                                        ...getEntityTableRowSx(theme),
                                        '& td': { py: 1 },
                                    }}
                                >
                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <DataPlaneIcon
                                                hideScopeIcon
                                                provider={provider}
                                                scope="private"
                                                size={20}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                {/* A button, so the row can be opened from the keyboard. */}
                                                <Link
                                                    component="button"
                                                    type="button"
                                                    noWrap
                                                    underline="hover"
                                                    title={getLinkServiceLabel(
                                                        config
                                                    )}
                                                    sx={{
                                                        ...monospaceSx,
                                                        color: 'text.primary',
                                                        display: 'block',
                                                        maxWidth: '100%',
                                                    }}
                                                >
                                                    {getLinkServiceLabel(
                                                        config
                                                    )}
                                                </Link>
                                                <Typography
                                                    noWrap
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {
                                                        PRIVATE_LINK_LABELS[
                                                            provider
                                                        ]
                                                    }
                                                    {crossRegion}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {row.dataPlane.displayName}
                                    </TableCell>
                                    <TableCell>
                                        <PrivateLinkStatus status={status} />
                                    </TableCell>
                                    <TableCell>
                                        <Address link={row.link} />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
