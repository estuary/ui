import { TableRow, useTheme } from '@mui/material';
import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectTableStoreNames } from 'stores/names';
import { useShardDetail_setShards } from 'stores/ShardDetail/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from 'stores/Tables/Store';
import { getPathWithParams, hasLength } from 'utils/misc-utils';
import OptionsMenu from '../cells/OptionsMenu';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';
import useCaptureColumns from './useCaptureColumns';

interface RowsProps {
    data: CaptureQueryWithStats[];
    showEntityStatus: boolean;
}

export interface RowProps {
    isSelected: boolean;
    row: CaptureQueryWithStats;
    setRow: any;
    showEntityStatus: boolean;
    stats?: StatsResponse;
}

function Row({ isSelected, setRow, row, stats, showEntityStatus }: RowProps) {
    const navigate = useNavigate();
    const theme = useTheme();
    const tableColumns = useCaptureColumns();
    const tenantDetails = useTenantDetails();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handlers = {
        clickRow: (rowId: string, lastPubId: string) => {
            setRow(rowId, lastPubId, !isSelected);
        },
        editTask: () => {
            navigate(
                getPathWithParams(authenticatedRoutes.captures.edit.fullPath, {
                    [GlobalSearchParams.CONNECTOR_ID]: row.connector_id,
                    [GlobalSearchParams.LIVE_SPEC_ID]: row.id,
                    [GlobalSearchParams.LAST_PUB_ID]: row.last_pub_id,
                })
            );
        },
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return (
        <>
            <TableRow
                hover
                onClick={() => handlers.clickRow(row.id, row.last_pub_id)}
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

                {hasLength(tenantDetails) ? (
                    <>
                        <Bytes
                            val={
                                stats
                                    ? stats[row.catalog_name]
                                          ?.bytes_written_by_me
                                    : null
                            }
                        />

                        <Docs
                            val={
                                stats
                                    ? stats[row.catalog_name]
                                          ?.docs_written_by_me
                                    : null
                            }
                        />
                    </>
                ) : null}

                <ChipList strings={row.writes_to} maxChips={5} />

                <TimeStamp time={row.updated_at} />

                <OptionsMenu
                    detailsExpanded={detailsExpanded}
                    toggleDetailsPanel={handlers.toggleDetailsPanel}
                    editTask={handlers.editTask}
                />
            </TableRow>

            <DetailsPanel
                detailsExpanded={detailsExpanded}
                lastPubId={row.last_pub_id}
                colSpan={tableColumns.length + 1}
                entityType="capture"
                entityName={row.catalog_name}
                collectionNames={row.writes_to}
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    // Select Table Store
    const selectTableStoreName = SelectTableStoreNames.CAPTURE;

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
