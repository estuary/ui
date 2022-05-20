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
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import { useRouteStore } from 'hooks/useRouteStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// TODO: Move this URL to src/utils/env-utils.ts
const baseUrl = new URL('http://localhost:28318');

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

    const shardDetailStore = useRouteStore();
    const setShards = shardDetailStore(shardDetailSelectors.setShards);

    if (showEntityStatus) {
        const shardClient = new ShardClient(baseUrl);
        const taskSelector = new ShardSelector().task(row.catalog_name);

        // TODO: Move this call to a more performant location or adjust the EntityStatus component
        // so that it has a sudo loading state. Additionally, this data will need to be polled in
        // some fashion. The code fragment below is merely an initial pass at integrating the shard
        // utilities provided by the data-plane-gateway.
        shardClient
            .list(taskSelector)
            .then((result) => {
                // TODO: Follow-up on this list method of the ShardClient class. The result currently
                // returns the shard spec which does not contain the shard status.
                const shards = result.unwrap();

                if (shards.length > 0) {
                    setShards(shards);
                }
            })
            .catch(() => {
                // TODO: Remove call to console.log().
                console.log('Inside capture catch statement');
            });
    }

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
