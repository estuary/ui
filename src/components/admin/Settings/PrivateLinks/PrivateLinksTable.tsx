import type {
    PrivateLink,
    PrivateLinkConfig,
} from 'src/utils/private-link-utils';

import {
    Box,
    Button,
    buttonClasses,
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
import {
    getCrossRegionDisplayName,
    getPrivateLinkContext,
    getPrivateLinkEndpoint,
    getPrivateLinkServiceLabel,
} from 'src/utils/private-link-utils';

interface PrivateLinksTableProps {
    links: PrivateLink[];
    firstConfig: PrivateLinkConfig;
    onOpen: (id: string) => void;
}

const codeSx = {
    typography: 'caption',
    fontFamily: 'monospace',
    overflowWrap: 'anywhere',
};
const captionSx = { display: 'block', color: 'text.secondary' };

export function PrivateLinksTable({
    links,
    firstConfig,
    onOpen,
}: PrivateLinksTableProps) {
    // Reserve the AWS endpoint ID column while provisioning is pending.
    const showEndpointId = firstConfig.__typename === 'AWSPrivateLink';

    return (
        <TableContainer>
            <Table
                size="small"
                aria-label="Private links"
                sx={[
                    compactTableSx,
                    {
                        'tableLayout': 'fixed',
                        // A narrower container scrolls sideways so the columns keep their widths.
                        'minWidth': 800,
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
                            {getPrivateLinkContext(firstConfig).label}
                        </TableCell>
                        {showEndpointId ? (
                            <TableCell scope="col">Endpoint ID</TableCell>
                        ) : null}
                        <TableCell scope="col">Endpoint address</TableCell>
                        <TableCell scope="col" aria-label="Actions" />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {links.map((link) => {
                        const { config, details, id, status } = link;
                        const endpoint = getPrivateLinkEndpoint(
                            config,
                            status === 'PROVISIONED' ? details : null
                        );
                        const service = getPrivateLinkServiceLabel(config);
                        const crossRegionName =
                            getCrossRegionDisplayName(config);
                        const context = getPrivateLinkContext(config);

                        return (
                            <TableRow key={id} hover>
                                <TableCell>
                                    <Typography
                                        component="code"
                                        variant="body2"
                                        sx={codeSx}
                                    >
                                        {service}
                                    </Typography>
                                    {crossRegionName ? (
                                        <Typography
                                            variant="caption"
                                            sx={captionSx}
                                        >
                                            Cross-region service in{' '}
                                            {crossRegionName}
                                        </Typography>
                                    ) : null}
                                </TableCell>
                                <MetadataCell value={context.value} />
                                {showEndpointId ? (
                                    <MetadataCell
                                        value={endpoint.awsEndpointId}
                                    />
                                ) : null}
                                <TableCell>
                                    <Address link={link} endpoint={endpoint} />
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

function MetadataCell({ value }: { value?: string }) {
    return (
        <TableCell sx={{ color: 'text.secondary' }}>
            <Box component="code" sx={codeSx}>
                {value || '—'}
            </Box>
        </TableCell>
    );
}

function Address({
    link,
    endpoint,
}: {
    link: PrivateLink;
    endpoint: ReturnType<typeof getPrivateLinkEndpoint>;
}) {
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
                {address.label === 'Private IP address'
                    ? 'Copy IP address'
                    : 'Copy DNS name'}
            </CopyToClipboardButton>
        </Box>
    );
}
