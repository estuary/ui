import {
    Box,
    Grid,
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
import { useEditorStore_specs } from 'components/editor/Store';
import ExternalLink from 'components/shared/ExternalLink';
import ShardErrors from 'components/tables/Details/ShardErrors';
import StatusIndicatorAndLabel from 'components/tables/Details/StatusIndicatorAndLabel';
import { slate } from 'context/Theme';
import {
    ShardDetailStoreNames,
    useZustandStore,
    UseZustandStore,
} from 'context/Zustand';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shardDetailSelectors, ShardDetailStore } from 'stores/ShardDetail';
import { ENTITY } from 'types';

interface Props {
    shardDetailStoreName: ShardDetailStoreNames;
    useLocalZustandStore: UseZustandStore;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

const rowsPerPage = 3;

function ShardInformation({ shardDetailStoreName, entityType }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const [page, setPage] = useState(0);

    const [taskShards, setTaskShards] = useState<Shard[]>([]);

    const shards = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['shards']
    >(shardDetailStoreName, shardDetailSelectors.shards);

    const getTaskShards = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getTaskShards']
    >(shardDetailStoreName, shardDetailSelectors.getTaskShards);

    // TODO: Update type LiveSpecsQuery_spec
    const specs = useEditorStore_specs({ localScope: true });

    const columns: {
        field: string | null;
        headerIntlKey: string | null;
    }[] = [
        {
            field: 'status',
            headerIntlKey: 'detailsPanel.shardDetails.status.label',
        },
        {
            field: 'id',
            headerIntlKey: 'detailsPanel.shardDetails.id.label',
        },
    ];

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

    return taskShards.length > 0 ? (
        <>
            <ShardErrors
                shards={taskShards}
                shardDetailStoreName={shardDetailStoreName}
            />

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
                                            justifyContent: 'space-between',
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
                                                link={intl.formatMessage({
                                                    id: 'detailsPanel.shardDetails.docPath',
                                                })}
                                            >
                                                <FormattedMessage id="detailsPanel.shardDetails.docLink" />
                                            </ExternalLink>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow sx={{ ...tableHeaderFooterSx }}>
                                {columns.map((column, index) => (
                                    <TableCell key={`${column.field}-${index}`}>
                                        <Typography>
                                            {column.headerIntlKey ? (
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
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
                                                theme.palette.mode === 'dark'
                                                    ? '#252526'
                                                    : slate[15],
                                        }} // This is the hex code for the monaco editor background in dark mode.
                                    >
                                        <StatusIndicatorAndLabel
                                            shard={shard}
                                            shardDetailStoreName={
                                                shardDetailStoreName
                                            }
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
    ) : null;
}

export default ShardInformation;
