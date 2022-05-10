import { Collapse, TableCell, TableRow } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import CaptureDetails from 'components/capture/Details';
import { createEditorStore } from 'components/editor/Store';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import Actions from 'components/tables/cells/Actions';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import MaterializeAction from 'components/tables/cells/MaterializeAction';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RowsProps {
    data: LiveSpecsExtQuery[];
}

interface RowProps {
    row: LiveSpecsExtQuery;
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

function Row({ row }: RowProps) {
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const navigate = useNavigate();
    const prefillCollections = useCreationStore(
        creationSelectors.prefillCollections
    );

    const handlers = {
        clickMaterialize: () => {
            const collections = row.writes_to;
            prefillCollections(collections);

            navigate(routeDetails.materializations.create.fullPath);
        },
    };

    return (
        <>
            <TableRow
                sx={{
                    background: detailsExpanded ? '#04192A' : null,
                }}
            >
                <EntityName name={row.catalog_name} />

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

            <TableRow>
                <TableCell
                    sx={detailsExpanded ? null : { pb: 0, pt: 0 }}
                    colSpan={tableColumns.length}
                >
                    <Collapse in={detailsExpanded} unmountOnExit>
                        <ZustandProvider
                            createStore={createEditorStore}
                            storeName="liveSpecEditor"
                        >
                            <CaptureDetails lastPubId={row.last_pub_id} />
                        </ZustandProvider>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row row={row} key={row.id} />
            ))}
        </>
    );
}

export default Rows;
