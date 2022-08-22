import { Button, TableCell, TableRow, useTheme } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import { LiveSpecsExtQuery } from 'components/tables/Materializations';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { getEntityTableRowSx } from 'context/Theme';
import {
    SelectTableStoreNames,
    ShardDetailStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useShardsList from 'hooks/useShardsList';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { shardDetailSelectors, ShardDetailStore } from 'stores/ShardDetail';
import { ENTITY } from 'types';
import { getPathWithParam } from 'utils/misc-utils';

interface RowsProps {
    data: LiveSpecsExtQuery[];
    showEntityStatus: boolean;
}

interface RowProps {
    row: LiveSpecsExtQuery;
    setRow: any;
    isSelected: boolean;
    showEntityStatus: boolean;
    shardDetailStoreName: ShardDetailStoreNames;
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
        field: 'connector_open_graph->en-US->>title',
        headerIntlKey: 'data.type',
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
        field: 'last_pub_user_full_name',
        headerIntlKey: 'entityTable.data.lastPubUserFullName',
    },
    {
        field: null,
        headerIntlKey: null,
    },
    {
        field: null,
        headerIntlKey: null,
    },
];

function Row({
    isSelected,
    setRow,
    row,
    showEntityStatus,
    shardDetailStoreName,
}: RowProps) {
    const navigate = useNavigate();
    const theme = useTheme();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handlers = {
        clickRow: (rowId: string) => {
            setRow(rowId, !isSelected);
        },
        editTask: () => {
            // TODO: Extend getPathWithParam utility to allow for the setting of multiple parameters.
            navigate(
                `${getPathWithParam(
                    authenticatedRoutes.materializations.edit.fullPath,
                    authenticatedRoutes.materializations.edit.params
                        .connectorId,
                    row.connector_id
                )}&${
                    authenticatedRoutes.materializations.edit.params.liveSpecId
                }=${row.id}&${
                    authenticatedRoutes.materializations.edit.params.lastPubId
                }=${row.last_pub_id}`
            );
        },
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
                    shardDetailStoreName={shardDetailStoreName}
                />

                <Connector
                    connectorImage={row.image}
                    connectorName={row.title}
                    imageTag={`${row.connector_image_name}${row.connector_image_tag}`}
                />

                <ChipList strings={row.reads_from} />

                <TimeStamp time={row.updated_at} />

                <UserName
                    avatar={row.last_pub_user_avatar_url}
                    email={row.last_pub_user_email}
                    name={row.last_pub_user_full_name}
                />

                <Actions>
                    <ExpandDetails
                        onClick={() => {
                            setDetailsExpanded(!detailsExpanded);
                        }}
                        expanded={detailsExpanded}
                    />
                </Actions>

                <TableCell>
                    <Button
                        variant="text"
                        size="small"
                        disableElevation
                        onClick={handlers.editTask}
                        sx={{ mr: 1 }}
                    >
                        <FormattedMessage id="cta.edit" />
                    </Button>
                </TableCell>
            </TableRow>

            <DetailsPanel
                collectionNames={row.reads_from}
                detailsExpanded={detailsExpanded}
                lastPubId={row.last_pub_id}
                colSpan={tableColumns.length}
                entityType={ENTITY.MATERIALIZATION}
                shardDetailStoreName={shardDetailStoreName}
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

    // Shard Detail Store
    const shardDetailStoreName = ShardDetailStoreNames.MATERIALIZATION;

    const setShards = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['setShards']
    >(shardDetailStoreName, shardDetailSelectors.setShards);

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
                    shardDetailStoreName={shardDetailStoreName}
                />
            ))}
        </>
    );
}

export default Rows;
