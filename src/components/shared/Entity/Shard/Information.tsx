import {
    Box,
    Grid,
    Stack,
    SxProps,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Theme,
    Typography,
    useTheme,
} from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { slate } from 'context/Theme';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useShardDetail_error,
    useShardDetail_getTaskShards,
    useShardDetail_shards,
} from 'stores/ShardDetail/hooks';
import { Entity, TableColumns } from 'types';
import ShardErrors from './Errors';
import StatusIndicatorAndLabel from './StatusIndicatorAndLabel';

interface Props {
    entityType?: Entity;
}

const rowsPerPage = 3;

const columns: TableColumns[] = [
    {
        field: 'status',
        headerIntlKey: 'detailsPanel.shardDetails.status.label',
    },
    {
        field: 'id',
        headerIntlKey: 'detailsPanel.shardDetails.id.label',
    },
];

function ShardInformation({ entityType }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const [page, setPage] = useState(0);
    const [taskShards, setTaskShards] = useState<Shard[]>([]);

    const shards = useShardDetail_shards();
    const error = useShardDetail_error();
    const getTaskShards = useShardDetail_getTaskShards();

    const specs = useEditorStore_specs<LiveSpecsQuery_spec>({
        localScope: true,
    });

    useEffect(() => {
        if (specs && specs.length > 0) {
            setTaskShards(
                getTaskShards(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name,
                    shards
                )
            );
        }
    }, [setTaskShards, getTaskShards, entityType, specs, shards]);

    const changePage = (
        _event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => setPage(newPage);

    const tableHeaderFooterSx: SxProps<Theme> = {
        background: theme.palette.background.paper,
    };

    return (
        <Stack direction="column" spacing={2} sx={{ m: 2 }}>
            <Typography
                component="span"
                variant="h6"
                sx={{
                    alignItems: 'center',
                }}
            >
                <FormattedMessage id="detailsPanel.status.header" />
            </Typography>
            {error ? (
                <AlertBox
                    severity="error"
                    short
                    title={
                        <FormattedMessage id="detailsPanel.shardDetails.fetchError" />
                    }
                >
                    <MessageWithLink messageID="error.message" />
                </AlertBox>
            ) : taskShards.length > 0 ? (
                <>
                    <ShardErrors shards={taskShards} />

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ ...tableHeaderFooterSx }}>
                                        <TableCell colSpan={columns.length}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <Typography
                                                    component="span"
                                                    align="center"
                                                    sx={{ width: '100%' }}
                                                >
                                                    <FormattedMessage id="detailsPanel.shardDetails.title" />
                                                </Typography>

                                                <Box
                                                    sx={{
                                                        minWidth: 'max-content',
                                                        position: 'sticky',
                                                        right: 0,
                                                    }}
                                                >
                                                    <ExternalLink
                                                        link={intl.formatMessage(
                                                            {
                                                                id: 'detailsPanel.shardDetails.docPath',
                                                            }
                                                        )}
                                                    >
                                                        <FormattedMessage id="detailsPanel.shardDetails.docLink" />
                                                    </ExternalLink>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={{ ...tableHeaderFooterSx }}>
                                        {columns.map((column, index) => (
                                            <TableCell
                                                key={`${column.field}-${index}`}
                                            >
                                                <Typography>
                                                    {column.headerIntlKey ? (
                                                        <FormattedMessage
                                                            id={
                                                                column.headerIntlKey
                                                            }
                                                        />
                                                    ) : null}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {taskShards
                                        .slice(
                                            page * rowsPerPage,
                                            page * rowsPerPage + rowsPerPage
                                        )
                                        .map((shard) => (
                                            <TableRow
                                                key={shard.spec.id}
                                                sx={{
                                                    background:
                                                        theme.palette.mode ===
                                                        'dark'
                                                            ? '#252526'
                                                            : slate[15],
                                                }} // This is the hex code for the monaco editor background in dark mode.
                                            >
                                                <StatusIndicatorAndLabel
                                                    shard={shard}
                                                />

                                                <TableCell>
                                                    <Typography>
                                                        {shard.spec.id}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>

                                <TableFooter>
                                    <TableRow sx={{ ...tableHeaderFooterSx }}>
                                        <TablePagination
                                            count={taskShards.length}
                                            rowsPerPageOptions={[rowsPerPage]}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={changePage}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Grid>
                </>
            ) : null}
        </Stack>
    );
}

export default ShardInformation;
