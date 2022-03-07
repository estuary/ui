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
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

function ConnectorsTable() {
    const { data, loading, error } = useConnectors();

    console.log('connectors ', data);

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
                        <TableRow
                            sx={{
                                background: (theme) =>
                                    theme.palette.background.default,
                            }}
                        >
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
                        {loading ? (
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
                        ) : data.data.length > 0 ? (
                            data.data.map((row: any, index: any) => (
                                <TableRow
                                    key={`Connector-${row.attributes.name}-${index}`}
                                >
                                    <TableCell style={columnStyling}>
                                        {row.attributes.name}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.attributes.description}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.attributes.type}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.attributes.maintainer}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        <FormattedDate
                                            day="numeric"
                                            month="long"
                                            year="numeric"
                                            value={row.attributes.updated_at}
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
