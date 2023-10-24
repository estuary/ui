import { TableRow, useTheme } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import Connector from 'components/tables/cells/Connector';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { useEntityType } from 'context/EntityContext';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { getEntityTableRowSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useShardHydration from 'hooks/shards/useShardHydration';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
    StatsResponse,
} from 'stores/Tables/Store';
import { getPathWithParams, hasLength } from 'utils/misc-utils';
import EntityNameLink from '../cells/EntityNameLink';
import OptionsMenu from '../cells/OptionsMenu';
import RelatedCollectionsCell from '../cells/RelatedCollectionsCell';
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
    const theme = useTheme();
    const tenantDetails = useTenantDetails();
    const entityType = useEntityType();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.materializations.details.overview.fullPath
    );

    const handlers = {
        clickRow: (rowId: string, lastPubId: string) => {
            setRow(rowId, lastPubId, !isSelected);
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
    };

    return (
        <TableRow
            hover
            onClick={() => handlers.clickRow(row.id, row.last_pub_id)}
            selected={isSelected}
            sx={getEntityTableRowSx(theme)}
        >
            <RowSelect isSelected={isSelected} name={row.catalog_name} />

            <EntityNameLink
                name={row.catalog_name}
                showEntityStatus={showEntityStatus}
                detailsLink={generatePath(row)}
                entityStatusTypes={[entityType]}
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

            <RelatedCollectionsCell values={row.reads_from} />

            <TimeStamp time={row.updated_at} />

            <OptionsMenu editTask={handlers.editTask} />
        </TableRow>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const { mutate: mutateShardsList } = useShardHydration(data);

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
