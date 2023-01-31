import { TableRow, useTheme } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import Actions from 'components/tables/cells/Actions';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    useShardDetail_setError,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { hasLength } from 'utils/misc-utils';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from '../Store';

interface RowProps {
    stats?: StatsResponse;
    row: CollectionQueryWithStats;
    showEntityStatus: boolean;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

function Row({ row, stats, showEntityStatus }: RowProps) {
    const detailsNavigator = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );
    const theme = useTheme();
    const tenantDetails = useTenantDetails();

    const calculatedBytes = useMemo(() => {
        if (stats) {
            return (
                (stats[row.catalog_name]?.bytes_written_by_me ?? 0) +
                (stats[row.catalog_name]?.bytes_written_to_me ?? 0)
            );
        } else {
            return 0;
        }
    }, [row.catalog_name, stats]);

    const calculatedDocs = useMemo(() => {
        if (stats) {
            return (
                (stats[row.catalog_name]?.docs_written_by_me ?? 0) +
                (stats[row.catalog_name]?.docs_written_to_me ?? 0)
            );
        } else {
            return 0;
        }
    }, [row.catalog_name, stats]);

    return (
        <TableRow
            key={`Entity-${row.id}`}
            sx={getEntityTableRowSx(theme, false)}
        >
            <EntityName
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
            />

            {hasLength(tenantDetails) ? (
                <>
                    <Bytes val={stats ? calculatedBytes : null} />

                    <Docs val={stats ? calculatedDocs : null} />
                </>
            ) : null}

            <TimeStamp time={row.updated_at} />

            <Actions>
                <ExpandDetails
                    onClick={() => {
                        detailsNavigator(row);
                    }}
                    expanded={false}
                />
            </Actions>
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    // Shard Detail Store
    const setShards = useShardDetail_setShards();
    const setShardsError = useShardDetail_setError();

    const { data: shardsData } = useShardsList(data);

    // Collection is the only entity (as of Dec 2022) that actually checks
    //  the error. This is because the default color for Collections is
    //  success and the other ones default to nothing.
    useEffect(() => {
        if (shardsData?.error) {
            setShardsError(shardsData.error);
        } else if (shardsData && shardsData.shards.length > 0) {
            setShards(shardsData.shards);
        }
    }, [setShards, setShardsError, shardsData]);

    const selectTableStoreName = SelectTableStoreNames.COLLECTION;

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.get);

    return (
        <>
            {data.map((row) => (
                <Row
                    stats={stats}
                    row={row}
                    showEntityStatus={showEntityStatus}
                    key={row.id}
                />
            ))}
        </>
    );
}

export default Rows;
