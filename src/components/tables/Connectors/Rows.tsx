import { Box, Button, TableCell, TableRow } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import ConnectorName from 'components/ConnectorName';
import { Connector } from 'components/tables/Connectors';
import Link from 'components/tables/Link';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

interface Props {
    data: Connector[];
}
const columnStyling = {
    minWidth: '10%',
    textOverflow: 'ellipsis',
};

export const tableColumns = [
    {
        field: null,
        headerIntlKey: 'connectorTable.data.title',
    },
    {
        field: 'image_name',
        headerIntlKey: 'connectorTable.data.image_name',
    },
    {
        field: null,
        headerIntlKey: 'connectorTable.data.protocol',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'connectorTable.data.updated_at',
    },
    {
        field: null,
        headerIntlKey: 'connectorTable.data.documentation_url',
    },
    {
        field: null,
        headerIntlKey: 'connectorTable.data.actions',
    },
];

function Rows({ data }: Props) {
    const navigate = useNavigate();

    return (
        <>
            {data.map((row) => {
                return row.connector_tags.length > 0 ? (
                    <TableRow key={`Connector-${row.id}`}>
                        <TableCell align="left" style={columnStyling}>
                            <ConnectorName
                                iconSize={40}
                                connector={row.open_graph}
                            />
                        </TableCell>
                        <TableCell style={columnStyling}>
                            {row.image_name}
                        </TableCell>
                        <TableCell style={columnStyling}>
                            {row.connector_tags[0].protocol}
                        </TableCell>
                        <TableCell style={columnStyling}>
                            <FormattedDate
                                day="numeric"
                                month="long"
                                year="numeric"
                                value={row.updated_at}
                            />
                        </TableCell>
                        <TableCell style={columnStyling}>
                            <Link
                                path={row.connector_tags[0].documentation_url}
                                messageId="captureCreation.config.source.doclink"
                            />
                        </TableCell>
                        <TableCell>
                            <Box
                                sx={{
                                    display: 'flex',
                                }}
                            >
                                <Button
                                    size="small"
                                    color={
                                        row.connector_tags[0].protocol ===
                                        'capture'
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    onClick={() => {
                                        if (
                                            row.connector_tags[0].protocol ===
                                            'capture'
                                        ) {
                                            navigate(
                                                `${routeDetails.captures.create.fullPath}?${routeDetails.captures.create.params.connectorID}=${row.connector_tags[0].id}`
                                            );
                                        } else if (
                                            row.connector_tags[0].protocol ===
                                            'materialization'
                                        ) {
                                            navigate(
                                                `${routeDetails.materializations.create.fullPath}?${routeDetails.materializations.create.params.connectorID}=${row.connector_tags[0].id}`
                                            );
                                        }
                                    }}
                                >
                                    {row.connector_tags[0].protocol ===
                                    'capture' ? (
                                        <FormattedMessage id="connectorTable.actionsCta.capture" />
                                    ) : (
                                        <FormattedMessage id="connectorTable.actionsCta.materialization" />
                                    )}
                                </Button>
                            </Box>
                        </TableCell>
                    </TableRow>
                ) : null;
            })}
        </>
    );
}

export default Rows;
