import { TableRow } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import MaterializeAction from 'components/tables/cells/MaterializeAction';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import DetailsPanel from 'components/tables/DetailsPanel';
// import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getShardList from 'services/shard-client';
import { shardDetailSelectors } from 'stores/ShardDetail';
import { getPathWithParam } from 'utils/misc-utils';

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
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: 'writes_to',
        headerIntlKey: 'entityTable.data.writesTo',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
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

    const navigate = useNavigate();

    const handlers = {
        clickMaterialize: () => {
            navigate(
                getPathWithParam(
                    routeDetails.materializations.create.fullPath,
                    routeDetails.materializations.create.params.specID,
                    row.id
                )
            );
        },
    };

    return (
        <>
            <TableRow
                sx={{
                    background: detailsExpanded ? '#04192A' : null,
                }}
            >
                <EntityName
                    name={row.catalog_name}
                    showEntityStatus={showEntityStatus}
                />

                <Connector
                    openGraph={row.connector_open_graph}
                    imageTag={`${row.connector_image_name}${row.connector_image_tag}`}
                />

                <ChipList strings={row.writes_to} />

                <Actions>
                    <MaterializeAction onClick={handlers.clickMaterialize} />
                </Actions>

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

    // TODO: Resolve the lag in the indicator color change. When the component is first rendered, the indicator
    // is the default color. When the component renders a second time, the indicator color reflects the status.
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
