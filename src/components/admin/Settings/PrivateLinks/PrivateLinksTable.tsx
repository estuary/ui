import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type {
    getLinkEndpoint,
    PrivateLink,
} from 'src/utils/private-link-utils';

import {
    Box,
    Button,
    buttonClasses,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import { compactTableSx } from 'src/components/admin/Settings/DataPlanes/compactTableSx';
import { PrivateLinkStatus } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkStatus';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { getRegionDisplayName } from 'src/utils/cloudRegions';
import {
    getAwsCrossRegion,
    getLinkContext,
    getLinkServiceLabel,
} from 'src/utils/private-link-utils';

export const PRIVATE_LINKS_PAGE_SIZE = 10;

export interface PrivateLinkRow {
    dataPlane: PrivateLinkDataPlane;
    link: PrivateLink;
    endpoint: ReturnType<typeof getLinkEndpoint>;
}

interface PrivateLinksTableProps {
    rows: PrivateLinkRow[];
    page: number;
    onOpen: (id: string) => void;
}

const STACK_BELOW = 650;

const codeSx = {
    typography: 'caption',
    fontFamily: 'monospace',
    overflowWrap: 'anywhere',
};
const captionSx = { display: 'block', color: 'text.secondary' };
const mobileLabelSx = {
    ...captionSx,
    display: 'none',
    [`@container (max-width: ${STACK_BELOW}px)`]: { display: 'block' },
};

export function PrivateLinksTable({
    rows,
    page,
    onOpen,
}: PrivateLinksTableProps) {
    const firstConfig = rows[0].link.config;
    // Reserve the AWS endpoint ID column while provisioning is pending.
    const showEndpointId = firstConfig.__typename === 'AWSPrivateLink';
    const start = (page - 1) * PRIVATE_LINKS_PAGE_SIZE;

    return (
        <TableContainer sx={{ containerType: 'inline-size' }}>
            <Table
                size="small"
                aria-label="Private links"
                sx={[
                    compactTableSx(STACK_BELOW),
                    {
                        'tableLayout': 'fixed',
                        '& th:first-of-type': {
                            width: showEndpointId ? '26%' : '36%',
                        },
                        '& th:nth-of-type(2)': {
                            width: showEndpointId ? '16%' : '22%',
                        },
                        '& th:nth-of-type(3)': {
                            width: showEndpointId ? '24%' : undefined,
                        },
                        '& th:last-of-type': {
                            width: (theme) => theme.spacing(11),
                        },
                    },
                ]}
            >
                <TableHead>
                    <TableRow>
                        <TableCell scope="col">Service</TableCell>
                        <TableCell scope="col">
                            {getLinkContext(firstConfig).label}
                        </TableCell>
                        {showEndpointId ? (
                            <TableCell scope="col">Endpoint ID</TableCell>
                        ) : null}
                        <TableCell scope="col">Endpoint address</TableCell>
                        <TableCell scope="col" aria-label="Actions" />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows
                        .slice(start, start + PRIVATE_LINKS_PAGE_SIZE)
                        .map((row) => {
                            const { config, id } = row.link;
                            const service = getLinkServiceLabel(config);
                            const crossRegion =
                                config.__typename === 'AWSPrivateLink'
                                    ? getAwsCrossRegion(config)
                                    : null;
                            const context = getLinkContext(config);

                            return (
                                <TableRow key={id} hover>
                                    <TableCell sx={{ gridColumn: '1 / -1' }}>
                                        <Typography
                                            component="code"
                                            variant="body2"
                                            sx={codeSx}
                                        >
                                            {service}
                                        </Typography>
                                        {crossRegion ? (
                                            <Typography
                                                variant="caption"
                                                sx={captionSx}
                                            >
                                                Cross-region service in{' '}
                                                {getRegionDisplayName(
                                                    'AWS',
                                                    crossRegion
                                                )}
                                            </Typography>
                                        ) : null}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            gridColumn: '1 / -1',
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={mobileLabelSx}
                                        >
                                            {context.label}
                                        </Typography>
                                        <Box component="code" sx={codeSx}>
                                            {context.value || '—'}
                                        </Box>
                                    </TableCell>
                                    {showEndpointId ? (
                                        <TableCell
                                            sx={{
                                                gridColumn: '1 / -1',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={mobileLabelSx}
                                            >
                                                Endpoint ID
                                            </Typography>
                                            <Box component="code" sx={codeSx}>
                                                {row.endpoint.awsEndpointId ??
                                                    '—'}
                                            </Box>
                                        </TableCell>
                                    ) : null}
                                    <TableCell>
                                        <Address row={row} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => onOpen(id)}
                                            aria-label={`Details for ${service}`}
                                            sx={{ whiteSpace: 'nowrap' }}
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function Address({ row }: { row: PrivateLinkRow }) {
    const { link, endpoint } = row;

    if (link.status !== 'PROVISIONED') {
        return <PrivateLinkStatus status={link.status} />;
    }

    const address = endpoint.addresses[0];

    if (!address) {
        return (
            <Typography variant="body2" color="text.secondary">
                No address reported
            </Typography>
        );
    }

    // Keep long addresses from wrapping across several lines.
    if (address.value.length > 40) {
        return (
            <Box
                sx={{
                    '& > button': {
                        px: 0,
                        whiteSpace: 'nowrap',
                        typography: 'caption',
                        fontWeight: 'fontWeightMedium',
                    },
                    [`& .${buttonClasses.endIcon}`]: {
                        'ml': 0.5,
                        'mr': 0,
                        '& svg': { width: 14, height: 14 },
                    },
                }}
            >
                <CopyToClipboardButton writeValue={address.value}>
                    Copy DNS name
                </CopyToClipboardButton>
            </Box>
        );
    }

    const service = getLinkServiceLabel(link.config);

    return (
        <Stack
            direction="row"
            useFlexGap
            spacing={0.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
            <Typography component="code" variant="body2" sx={codeSx}>
                {address.value}
            </Typography>
            <CopyToClipboardButton
                label={`Copy ${address.label} for ${service}`}
                writeValue={address.value}
            />
        </Stack>
    );
}
