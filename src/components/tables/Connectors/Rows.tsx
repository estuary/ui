import {
    Box,
    Button,
    Stack,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
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
        field: 'detail',
        headerIntlKey: 'connectorTable.data.detail',
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
        headerIntlKey: 'connectorTable.data.external_url',
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
                return (
                    <TableRow key={`Connector-${row.id}`}>
                        <TableCell align="left" style={columnStyling}>
                            <ConnectorName
                                path={row.open_graph['en-US'].image}
                                connector={row}
                            />
                        </TableCell>
                        <TableCell style={columnStyling}>
                            <Stack direction="row">{row.image_name}</Stack>
                        </TableCell>
                        <TableCell style={columnStyling}>
                            <Typography variant="subtitle2">
                                {row.detail}
                            </Typography>
                            <Typography>
                                {row.open_graph['en-US'].description}
                            </Typography>
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
                        <TableCell style={columnStyling}>
                            <Link
                                path={row.external_url}
                                messageId="captureCreation.config.source.homepage"
                            />
                        </TableCell>
                        <TableCell>
                            <Box
                                sx={{
                                    display: 'flex',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    disableElevation
                                    onClick={() => {
                                        if (
                                            row.connector_tags[0].protocol ===
                                            'capture'
                                        ) {
                                            navigate(
                                                `${routeDetails.capture.create.fullPath}?${routeDetails.capture.create.params.connectorID}=${row.connector_tags[0].id}`
                                            );
                                        } else if (
                                            row.connector_tags[0].protocol ===
                                            'materialization'
                                        ) {
                                            navigate(
                                                `${routeDetails.materialization.create.fullPath}?${routeDetails.materialization.create.params.connectorID}=${row.connector_tags[0].id}`
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
                );
            })}
        </>
    );
}

export default Rows;
