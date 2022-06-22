import { Box, Button, TableCell, TableRow } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import ConnectorName from 'components/ConnectorName';
import Link from 'components/tables/Link';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CONNECTOR_NAME } from 'services/supabase';
import { getPathWithParam } from 'utils/misc-utils';

interface Props {
    data: ConnectorWithTagDetailQuery[];
}
const columnStyling = {
    minWidth: '10%',
    textOverflow: 'ellipsis',
};

export const tableColumns = [
    {
        field: CONNECTOR_NAME,
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
                                connector={row.title}
                                iconPath={row.image}
                            />
                        </TableCell>
                        <TableCell style={columnStyling}>
                            {row.image_name}
                        </TableCell>
                        <TableCell style={columnStyling}>
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
                                                getPathWithParam(
                                                    authenticatedRoutes.captures
                                                        .create.fullPath,
                                                    authenticatedRoutes.captures
                                                        .create.params
                                                        .connectorID,
                                                    row.connector_tags[0].id
                                                )
                                            );
                                        } else if (
                                            row.connector_tags[0].protocol ===
                                            'materialization'
                                        ) {
                                            navigate(
                                                getPathWithParam(
                                                    authenticatedRoutes
                                                        .materializations.create
                                                        .fullPath,
                                                    authenticatedRoutes
                                                        .materializations.create
                                                        .params.connectorId,
                                                    row.connector_tags[0].id
                                                )
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
                                messageId="captureCreate.config.source.doclink"
                            />
                        </TableCell>
                    </TableRow>
                ) : null;
            })}
        </>
    );
}

export default Rows;
