import { TableRow } from '@mui/material';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import DetailsPanel from 'components/tables/DetailsPanel';
import { LiveSpecsExtQuery } from 'components/tables/Materializations';
// import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useState } from 'react';
import getShardList from 'services/shard-client';
import { shardDetailSelectors } from 'stores/ShardDetail';

interface RowsProps {
    data: LiveSpecsExtQuery[];
    showEntityStatus: boolean;
}

interface RowProps {
    row: LiveSpecsExtQuery;
    showEntityStatus: boolean;
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
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

function Row({ row, showEntityStatus }: RowProps) {
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    return (
        <>
            <TableRow key={`Entity-${row.id}`}>
                <EntityName
                    name={row.catalog_name}
                    showEntityStatus={showEntityStatus}
                />

                <Connector
                    openGraph={row.connector_open_graph}
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
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    const shardDetailStore = useRouteStore();
    const shards = shardDetailStore(shardDetailSelectors.shards);
    const setShards = shardDetailStore(shardDetailSelectors.setShards);

    // useGatewayAuthToken(data, setShards);

    const gatewayUrlString = localStorage.getItem('gateway-url');
    const authToken = localStorage.getItem('auth-gateway-jwt');

    useEffect(() => {
        if (gatewayUrlString && authToken) {
            const gatewayUrl = new URL(gatewayUrlString);

            getShardList(gatewayUrl, authToken, data, setShards);
        }
    }, [gatewayUrlString, authToken, data, setShards]);

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            if (gatewayUrlString && authToken) {
                const gatewayUrl = new URL(gatewayUrlString);

                getShardList(gatewayUrl, authToken, data, setShards);
            }
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [gatewayUrlString, authToken, shards, data, setShards]);

    return (
        <>
            {data.map((row) => (
                <Row
                    row={row}
                    showEntityStatus={showEntityStatus}
                    key={row.id}
                />
            ))}
        </>
    );
}

export default Rows;
