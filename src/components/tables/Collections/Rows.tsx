import { TableRow, useTheme } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
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
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';
import EntityNameLink from '../cells/EntityNameLink';
import RowSelect from '../cells/RowSelect';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';

interface RowProps {
    isSelected: boolean;
    row: CollectionQueryWithStats;
    setRow: any;
    showEntityStatus: boolean;
    stats?: StatsResponse;
}

interface RowsProps {
    data: CollectionQueryWithStats[];
    showEntityStatus: boolean;
}

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
    const theme = useTheme();
    const tenantDetails = useTenantDetails();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );

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
            selected={isSelected}
            onClick={() => setRow(row.id, row.last_pub_id, !isSelected)}
            sx={getEntityTableRowSx(theme, false)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityNameLink
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
                detailsLink={generatePath(row)}
            />

            {hasLength(tenantDetails) ? (
                <>
                    <Bytes val={stats ? calculatedBytes : null} />

                    <Docs val={stats ? calculatedDocs : null} />
                </>
            ) : null}

            <TimeStamp time={row.updated_at} />
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

    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.set);

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.get);

    return (
        <>
            {data.map((row) => (
                <Row
                    isSelected={selected.has(row.id)}
                    key={row.id}
                    row={row}
                    setRow={setRow}
                    showEntityStatus={showEntityStatus}
                    stats={stats}
                />
            ))}
        </>
    );
}

export default Rows;
