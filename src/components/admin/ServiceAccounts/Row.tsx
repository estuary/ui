import type { ServiceAccount } from 'src/gql-types/graphql';

import { useState } from 'react';

import {
    Chip,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowDown, NavArrowRight } from 'iconoir-react';

import ServiceAccountActions from 'src/components/admin/ServiceAccounts/Actions';
import ApiKeysRow from 'src/components/admin/ServiceAccounts/ApiKeysRow';
import { getEntityTableRowSx } from 'src/context/Theme';

interface ServiceAccountRowProps {
    serviceAccount: ServiceAccount;
}

function ServiceAccountRow({ serviceAccount: sa }: ServiceAccountRowProps) {
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);
    const isDisabled = Boolean(sa.disabledAt);

    return (
        <>
            <TableRow
                hover
                sx={{
                    ...getEntityTableRowSx(theme),
                    '& td:not(:last-child)': {
                        opacity: isDisabled ? 0.6 : 1,
                    },
                }}
            >
                <TableCell sx={{ width: 48 }}>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? (
                            <NavArrowDown
                                fontSize="small"
                                style={{ fontSize: '1rem' }}
                            />
                        ) : (
                            <NavArrowRight
                                fontSize="small"
                                style={{ fontSize: '1rem' }}
                            />
                        )}
                    </IconButton>
                </TableCell>

                <TableCell>
                    <Typography>{sa.displayName}</Typography>
                </TableCell>

                <TableCell sx={{ maxWidth: 200 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'monospace',
                            overflowWrap: 'anywhere',
                            wordBreak: 'keep-all',
                        }}
                    >
                        {sa.prefix
                            .split(/(?<=[/_-])/)
                            .map((segment: string, i: number) => (
                                <span key={i}>
                                    {segment}
                                    <wbr />
                                </span>
                            ))}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Chip
                        label={sa.capability}
                        size="small"
                        variant="outlined"
                    />
                </TableCell>

                <TableCell>
                    <Tooltip
                        title={`${sa.apiKeys.length} API ${sa.apiKeys.length === 1 ? 'key' : 'keys'}`}
                    >
                        <Chip
                            label={sa.apiKeys.length}
                            size="small"
                            color={sa.apiKeys.length > 0 ? 'info' : 'default'}
                        />
                    </Tooltip>
                </TableCell>

                <TableCell>
                    <Chip
                        label={isDisabled ? 'Disabled' : 'Active'}
                        size="small"
                        color={isDisabled ? 'default' : 'success'}
                        variant="outlined"
                    />
                </TableCell>

                <TableCell>
                    <ServiceAccountActions serviceAccount={sa} />
                </TableCell>
            </TableRow>

            {expanded ? (
                <ApiKeysRow serviceAccount={sa} isDisabled={isDisabled} />
            ) : null}
        </>
    );
}

export default ServiceAccountRow;
