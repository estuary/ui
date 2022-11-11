import { TableRow, useTheme } from '@mui/material';
import { CaptureQueryWithStats } from 'api/liveSpecsExt';
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
} from 'components/tables/Store';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUERY_PARAM_CONNECTOR_TITLE } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import { useShardDetail_setShards } from 'stores/ShardDetail/hooks';
import { getPathWithParams } from 'utils/misc-utils';
import Bytes from '../cells/stats/Bytes';
import Docs from '../cells/stats/Docs';

interface RowsProps {
    data: CaptureQueryWithStats[];
    showEntityStatus: boolean;
}

export interface RowProps {
    row: CaptureQueryWithStats;
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
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.bytes_written_by_me',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.stats.docs_written_by_me',
    },
    {
        field: 'writes_to',
        headerIntlKey: 'entityTable.data.writesTo',
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

function Row({ isSelected, setRow, row, showEntityStatus }: RowProps) {
    const navigate = useNavigate();
    const theme = useTheme();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handlers = {
        clickMaterialize: () => {
            navigate(
                getPathWithParams(
                    authenticatedRoutes.materializations.create.fullPath,
                    {
                        [GlobalSearchParams.LIVE_SPEC_ID]: row.id,
                    }
                )
            );
        },
        clickRow: (rowId: string) => {
            setRow(rowId, !isSelected);
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

                <Bytes val={row.stats.bytes_written_to_me} />

                <Docs val={row.stats.docs_written_to_me} />

                <ChipList strings={row.writes_to} />

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
                colSpan={tableColumns.length}
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
