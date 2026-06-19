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

import { DateTime } from 'luxon';

import ApiKeysRow from 'src/components/admin/ServiceAccounts/ApiKeysRow';
import { getEntityTableRowSx } from 'src/context/Theme';

interface ServiceAccountRowProps {
    serviceAccount: ServiceAccount;
}

function ServiceAccountRow({ serviceAccount: sa }: ServiceAccountRowProps) {
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);

    const tokenCount = sa.tokens.length;

    return (
        <>
            <TableRow hover sx={getEntityTableRowSx(theme)}>
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

                <TableCell sx={{ maxWidth: 280 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'monospace',
                            overflowWrap: 'anywhere',
                            wordBreak: 'keep-all',
                        }}
                    >
                        {sa.catalogName
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
                    <Typography variant="body2">
                        {DateTime.fromISO(sa.createdAt).toLocaleString(
                            DateTime.DATE_MED
                        )}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {sa.lastUsedAt
                            ? DateTime.fromISO(sa.lastUsedAt).toRelative()
                            : 'Never'}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Tooltip
                        title={`${tokenCount} API ${tokenCount === 1 ? 'key' : 'keys'}`}
                    >
                        <Chip
                            label={tokenCount}
                            size="small"
                            color={tokenCount > 0 ? 'info' : 'default'}
                        />
                    </Tooltip>
                </TableCell>
            </TableRow>

            {expanded ? <ApiKeysRow serviceAccount={sa} /> : null}
        </>
    );
}

export default ServiceAccountRow;
