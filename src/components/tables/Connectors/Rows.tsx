import { FormattedDate, FormattedMessage } from 'react-intl';

import { Box, Button, TableCell, TableRow } from '@mui/material';

import ConnectorName from 'components/connectors/ConnectorName';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import Link from 'components/tables/Link';

import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';

import { CONNECTOR_NAME } from 'services/supabase';

interface Props {
    data: ConnectorWithTagDetailQuery[];
}
const columnStyling = {
    minWidth: '10%',
    textOverflow: 'ellipsis',
};

export const tableColumns: {
    field: keyof ConnectorWithTagDetailQuery | null;
    headerIntlKey: string;
}[] = [
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
    const navigateToCreate = useEntityCreateNavigate();

    return (
        <>
            {data.map((row) => {
                return row.connector_tags.length > 0 ? (
                    <TableRow key={`Connector-${row.id}`}>
                        <TableCell align="left" style={columnStyling}>
                            <ConnectorName
                                iconSize={40}
                                title={row.title}
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
                                        navigateToCreate(
                                            row.connector_tags[0].protocol,
                                            row.connector_tags[0].id
                                        );
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
