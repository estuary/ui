import { TableRow, useTheme } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import OptionsMenu from 'components/tables/cells/OptionsMenu';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from 'components/tables/Store';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import useShardsList from 'hooks/useShardsList';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SelectTableStoreNames } from 'stores/names';
import { useShardDetail_setShards } from 'stores/ShardDetail/hooks';
import { getPathWithParams, hasLength } from 'utils/misc-utils';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';

interface RowsProps {
    data: MaterializationQueryWithStats[];
    showEntityStatus: boolean;
}

interface RowProps {
    stats?: StatsResponse;
    row: MaterializationQueryWithStats;
    setRow: any;
    isSelected: boolean;
    showEntityStatus: boolean;
}

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
    const navigate = useNavigate();
    const detailsNavigator = useDetailsNavigator(
        authenticatedRoutes.materializations.details.fullPath
    );
    const theme = useTheme();
    const tenantDetails = useTenantDetails();

    const handlers = {
        clickRow: (rowId: string) => {
            setRow(rowId, !isSelected);
        },
        editTask: () => {
            navigate(
                getPathWithParams(
                    authenticatedRoutes.materializations.edit.fullPath,
                    {
                        [GlobalSearchParams.CONNECTOR_ID]: row.connector_id,
                        [GlobalSearchParams.LIVE_SPEC_ID]: row.id,
                        [GlobalSearchParams.LAST_PUB_ID]: row.last_pub_id,
                    }
                )
            );
        },
        toggleDetailsPanel: () => detailsNavigator(row),
    };

    return (
        <TableRow
            hover
            onClick={() => handlers.clickRow(row.id)}
            selected={isSelected}
            sx={getEntityTableRowSx(theme, false)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityName
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
            />

            <Connector
                connectorImage={row.image}
                connectorName={row.title}
                imageTag={`${row.connector_image_name}${row.connector_image_tag}`}
            />

            {hasLength(tenantDetails) ? (
                <>
                    <Bytes
                        read
                        val={
                            stats
                                ? stats[row.catalog_name]?.bytes_read_by_me
                                : null
                        }
                    />

                    <Docs
                        read
                        val={
                            stats
                                ? stats[row.catalog_name]?.docs_read_by_me
                                : null
                        }
                    />
                </>
            ) : null}

            <ChipList strings={row.reads_from} maxChips={5} />

            <TimeStamp time={row.updated_at} />

            <OptionsMenu
                detailsExpanded={false}
                toggleDetailsPanel={handlers.toggleDetailsPanel}
                editTask={handlers.editTask}
            />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    // Select Table Store
    const selectTableStoreName = SelectTableStoreNames.MATERIALIZATION;

    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.set);

    const successfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['successfulTransformations']
    >(
        selectTableStoreName,
        selectableTableStoreSelectors.successfulTransformations.get
    );

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectTableStoreName, selectableTableStoreSelectors.stats.get);

    // Shard Detail Store
    const setShards = useShardDetail_setShards();

    const { data: shardsData, mutate: mutateShardsList } = useShardsList(data);

    useEffect(() => {
        if (shardsData && shardsData.shards.length > 0) {
            setShards(shardsData.shards);
        }
    }, [setShards, shardsData]);

    useEffect(() => {
        mutateShardsList().catch(() => {});
    }, [mutateShardsList, successfulTransformations]);

    return (
        <>
            {data.map((row) => (
                <Row
                    stats={stats}
                    row={row}
                    key={row.id}
                    isSelected={selected.has(row.id)}
                    setRow={setRow}
                    showEntityStatus={showEntityStatus}
                />
            ))}
        </>
    );
}

export default Rows;
