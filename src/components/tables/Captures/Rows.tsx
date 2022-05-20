import { Checkbox, TableCell, TableRow } from '@mui/material';
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
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPathWithParam } from 'utils/misc-utils';

interface RowsProps {
    data: LiveSpecsExtQuery[];
}

interface RowProps {
    row: LiveSpecsExtQuery;
    setRow: any;
    isSelected: boolean;
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

function Row({ isSelected, setRow, row }: RowProps) {
    const navigate = useNavigate();

    const [detailsExpanded, setDetailsExpanded] = useState(false);

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
                }}
            >
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        checked={isSelected}
                        inputProps={{
                            'aria-labelledby': row.catalog_name,
                        }}
                    />
                </TableCell>
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

            <DetailsPanel
                detailsExpanded={detailsExpanded}
                id={row.last_pub_id}
                colSpan={tableColumns.length}
            />
        </>
    );
}

function Rows({ data }: RowsProps) {
    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const setRow = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setSelected']
    >(selectableTableStoreSelectors.selected.set);

    return (
        <>
            {data.map((row) => (
                <Row
                    row={row}
                    key={row.id}
                    isSelected={selected.has(row.id)}
                    setRow={setRow}
                />
            ))}
        </>
    );
}

export default Rows;
