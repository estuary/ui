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
import useConnectors from 'hooks/useConnectors';
import { FormattedMessage, useIntl } from 'react-intl';

function ConnectorsTable() {
    const { data, isLoading, error } = useConnectors();

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.name',
            headerIntlKey: 'data.name',
        },
        {
            field: 'attributes.description',
            headerIntlKey: 'data.description',
        },
        {
            field: 'attributes.type',
            headerIntlKey: 'data.type',
        },
        {
            field: 'attributes.maintainer',
            headerIntlKey: 'data.maintainer',
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
                <FormattedMessage id="terms.connectors" />
            </Typography>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350 }}
                    aria-label={intl.formatMessage({
                        id: 'connectors.title',
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : data ? (
                            <code>{JSON.stringify(data)}</code>
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
