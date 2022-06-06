import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import ShardErrors from 'components/tables/Details/ShardErrors';
import StatusIndicatorAndLabel from 'components/tables/Details/StatusIndicatorAndLabel';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shardDetailSelectors } from 'stores/ShardDetail';
import { ENTITY } from 'types';

interface Props {
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function ShardInformation({ entityType }: Props) {
    const theme = useTheme();

    const [page, setPage] = useState(0);

    const [taskShards, setTaskShards] = useState<Shard[]>([]);

    const useShardDetailStore = useRouteStore();
    const shards = useShardDetailStore(shardDetailSelectors.shards);
    const getTaskShards = useShardDetailStore(
        shardDetailSelectors.getTaskShards
    );

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['specs']
    >((state) => state.specs);

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

    return taskShards.length > 0 ? (
        <>
            <ShardErrors shards={taskShards} />

            <Grid item xs={12}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background:
                                        theme.palette.background.default,
                                }}
                            >
                                <TableCell colSpan={columns.length}>
                                    <Typography align="center">
                                        <FormattedMessage id="detailsPanel.shardDetails.title" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow
                                sx={{
                                    background: theme.palette.background.paper,
                                }}
                            >
                                {columns.map((column, index) => (
                                    <TableCell key={`${column.field}-${index}`}>
                                        <Typography>
                                            {column.headerIntlKey && (
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            )}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {taskShards.map((shard) => (
                                <TableRow
                                    key={shard.spec.id}
                                    sx={{
                                        background:
                                            theme.palette.background.paper,
                                    }}
                                >
                                    <StatusIndicatorAndLabel shard={shard} />

                                    <TableCell>
                                        <Typography>{shard.spec.id}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={taskShards.length}
                                    rowsPerPageOptions={[3]}
                                    rowsPerPage={3}
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
