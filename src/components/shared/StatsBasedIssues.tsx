/* eslint-disable @typescript-eslint/no-base-to-string */
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { shardTableRow } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { StatsDetails } from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';

interface Props {
    stats?: StatsDetails | null;
}

function Issues({ stats }: Props) {
    const tenantDetails = useTenantDetails();
    const hasStats = hasLength(tenantDetails);

    if (!hasStats) return null;

    return (
        <Box
            sx={{
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Table
                size="small"
                sx={{
                    background: (theme) => shardTableRow[theme.palette.mode],
                    maxWidth: 'min-content',
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="right">
                            <FormattedMessage id="data.warnings" />
                        </TableCell>
                        <TableCell align="right">
                            <FormattedMessage id="data.errors" />
                        </TableCell>
                        <TableCell align="right">
                            <FormattedMessage id="data.failures" />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell align="right">{`${
                            stats?.warnings ?? '?'
                        }`}</TableCell>
                        <TableCell align="right">{`${
                            stats?.errors ?? '?'
                        }`}</TableCell>
                        <TableCell align="right">{`${
                            stats?.failures ?? '?'
                        }`}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Box>
    );
}

export default Issues;
