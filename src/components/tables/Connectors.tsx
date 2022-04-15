import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import Error from 'components/shared/Error';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';

interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
    };
    id: string;
    image_tag: string;
    protocol: string;
    updated_at: string;
}

const CONNECTOR_TAGS_QUERY = `
    connectors(
        detail,
        image_name
    ),
    id,
    image_tag,
    protocol,
    updated_at
`;

function ConnectorsTable() {
    const tagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAGS_QUERY,
            filter: (query) => query.order('updated_at', { ascending: false }),
        },
        []
    );
    const { data: tags, error, isValidating } = useSelect(tagsQuery, {});

    const intl = useIntl();

    const columns = [
        {
            headerIntlKey: 'data.name',
        },
        {
            headerIntlKey: 'data.description',
        },
        {
            headerIntlKey: 'data.type',
        },
        {
            headerIntlKey: 'data.updated_at',
        },
    ];
    const columnStyling = {
        maxWidth: '20%',
        textOverflow: 'ellipsis',
        width: '20%',
    };

    return (
        <Box>
            <Typography>
                <FormattedMessage id="connectorTable.title" />
            </Typography>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350 }}
                    aria-label={intl.formatMessage({
                        id: 'connectorTable.title.aria',
                    })}
                >
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => {
                                return (
                                    <TableCell
                                        key={`${column.headerIntlKey}-${index}`}
                                        style={columnStyling}
                                    >
                                        <FormattedMessage
                                            id={column.headerIntlKey}
                                        />
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isValidating ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <Error error={error} />
                                </TableCell>
                            </TableRow>
                        ) : tags?.data ? (
                            tags.data.map((row, index) => (
                                <TableRow key={`Connector-${row.id}-${index}`}>
                                    <TableCell style={columnStyling}>
                                        {row.connectors.image_name}
                                        {row.image_tag}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.connectors.detail}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.protocol}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        <FormattedDate
                                            day="numeric"
                                            month="long"
                                            year="numeric"
                                            value={row.updated_at}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                >
                                    <FormattedMessage id="common.noData" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ConnectorsTable;
