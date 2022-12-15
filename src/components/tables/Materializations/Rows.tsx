import { TableRow, useTheme } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import OptionsMenu from 'components/tables/cells/OptionsMenu';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from 'components/tables/Store';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { QUERY_PARAM_CONNECTOR_TITLE } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import { useShardDetail_setShards } from 'stores/ShardDetail/hooks';
import { getPathWithParams } from 'utils/misc-utils';
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

export const tableColumns = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: QUERY_PARAM_CONNECTOR_TITLE,
        headerIntlKey: 'data.type',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.bytes_read_by_me',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.docs_read_by_me',
    },
    {
        field: 'reads_from',
        headerIntlKey: 'entityTable.data.readsFrom',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: null,
        headerIntlKey: null,
    },
];

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
    const navigate = useNavigate();
    const theme = useTheme();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

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
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return (
        <>
            <TableRow
                hover
                onClick={() => handlers.clickRow(row.id)}
                selected={isSelected}
                sx={getEntityTableRowSx(theme, detailsExpanded)}
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

                <Bytes
                    val={
                        stats ? stats[row.catalog_name]?.bytes_read_by_me : null
                    }
                />

                <Docs
                    val={
                        stats ? stats[row.catalog_name]?.docs_read_by_me : null
                    }
                />

                <ChipList strings={row.reads_from} />

                <TimeStamp time={row.updated_at} />

                <OptionsMenu
                    detailsExpanded={detailsExpanded}
                    toggleDetailsPanel={handlers.toggleDetailsPanel}
                    editTask={handlers.editTask}
                />
            </TableRow>

            <DetailsPanel
                collectionNames={row.reads_from}
                detailsExpanded={detailsExpanded}
                lastPubId={row.last_pub_id}
                colSpan={tableColumns.length}
                entityType="materialization"
                entityName={row.catalog_name}
            />
        </>
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
