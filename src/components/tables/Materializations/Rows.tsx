import { TableRow } from '@mui/material';
import { Auth } from '@supabase/ui';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import RowSelect from 'components/tables/cells/RowSelect';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import DetailsPanel from 'components/tables/DetailsPanel';
import { LiveSpecsExtQuery } from 'components/tables/Materializations';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { usePreFetchData } from 'context/PreFetchData';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';
import getShardList from 'services/shard-client';
import { shardDetailSelectors } from 'stores/ShardDetail';
import { ENTITY } from 'types';
import { getStoredGatewayAuthConfig } from 'utils/env-utils';

interface RowsProps {
    data: LiveSpecsExtQuery[];
    showEntityStatus: boolean;
}

interface RowProps {
    row: LiveSpecsExtQuery;
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
];

function Row({ isSelected, setRow, row, showEntityStatus }: RowProps) {
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handlers = {
        clickRow: (rowId: string) => {
            setRow(rowId, !isSelected);
        },
    };

    return (
        <>
            <TableRow
                hover
                onClick={() => handlers.clickRow(row.id)}
                selected={isSelected}
                sx={{
                    background: detailsExpanded ? '#04192A' : null,
                    cursor: 'pointer',
                }}
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
            </TableRow>

            <DetailsPanel
                detailsExpanded={detailsExpanded}
                id={row.last_pub_id}
                colSpan={tableColumns.length}
                entityType={ENTITY.MATERIALIZATION}
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectableTableStoreSelectors.selected.set);

    const shardDetailStore = useRouteStore();
    const shards = shardDetailStore(shardDetailSelectors.shards);
    const setShards = shardDetailStore(shardDetailSelectors.setShards);

    const { session } = Auth.useUser();
    const { grantDetails } = usePreFetchData();

    useEffect(() => {
        const gatewayConfig = getStoredGatewayAuthConfig();

        if (gatewayConfig?.gateway_url && gatewayConfig.token && session) {
            const gatewayUrl = new URL(gatewayConfig.gateway_url);

            getShardList(
                gatewayUrl,
                gatewayConfig.token,
                data,
                setShards,
                session.access_token,
                grantDetails
            );
        }
    }, [data, setShards, session, grantDetails]);

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            const gatewayConfig = getStoredGatewayAuthConfig();

            if (gatewayConfig?.gateway_url && gatewayConfig.token && session) {
                const gatewayUrl = new URL(gatewayConfig.gateway_url);

                getShardList(
                    gatewayUrl,
                    gatewayConfig.token,
                    data,
                    setShards,
                    session.access_token,
                    grantDetails
                );
            }
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [shards, data, setShards, session, grantDetails]);

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
