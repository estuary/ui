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

    const [shards, setShards] = useState<Shard[]>([]);

    const useShardDetailStore = useRouteStore();
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
            setShards(
                getTaskShards(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name
                )
            );
        }
    }, [specs, setShards, getTaskShards, entityType]);

    const changePage = (
        _event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => setPage(newPage);

    return shards.length > 0 ? (
        <>
            <ShardErrors shards={shards} />

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
                            {shards.map((shard) => (
                                <TableRow
                                    key={shard.spec.id}
                                    sx={{
                                        background:
                                            theme.palette.background.paper,
                                    }}
                                >
                                    <StatusIndicatorAndLabel shard={shard} />
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={shards.length}
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
