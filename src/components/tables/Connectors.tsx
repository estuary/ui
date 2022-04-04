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
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { useQuery, useSelect } from 'supabase-swr';

function ConnectorsTable() {
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
    const tagsQuery = useQuery<ConnectorTag>(
        'connector_tags',
        {
            columns: `
            connectors(
                detail,
                image_name
            ),
            id,
            image_tag,
            protocol,
            updated_at
            `,
            filter: (q) => q.order('updated_at', { ascending: false }),
        },
        []
    );
    const { data: tags, error, isValidating } = useSelect(tagsQuery, {});

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.image_name',
            headerIntlKey: 'data.name',
        },
        {
            field: 'attributes.detail',
            headerIntlKey: 'data.description',
        },
        {
            field: 'attributes.protocol',
            headerIntlKey: 'data.type',
        },
        {
            field: 'attributes.updated_at',
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
                                        key={`${column.field}-${index}`}
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
