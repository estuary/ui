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

interface ConnectorsTableProps {
    maxHeight: number;
}

function ConnectorsTable(props: ConnectorsTableProps) {
    const { maxHeight } = props;

    const {
        data: { connectors },
        loading,
        error,
    } = useConnectors();

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

    return (
        <Box
            sx={{
                height: '100%',
                mx: 2,
                overflow: 'auto',
            }}
        >
            {loading ? <FormattedMessage id="common.loading" /> : null}

            {error ? { fetchingConnectorsError: error } : null}

            {connectors.length > 0 ? (
                <TableContainer sx={{ maxHeight }}>
                    <Typography>
                        <FormattedMessage id="terms.connectors" />
                    </Typography>
                    <Table
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
                            {connectors.map((row, index) => (
                                <TableRow key={`Connector-${row.id}-${index}`}>
                                    <TableCell>{row.attributes.name}</TableCell>
                                    <TableCell>
                                        {row.attributes.description}
                                    </TableCell>
                                    <TableCell>{row.attributes.type}</TableCell>
                                    <TableCell>
                                        {row.attributes.maintainer}
                                    </TableCell>
                                    <TableCell>
                                        <FormattedDate
                                            day="numeric"
                                            month="long"
                                            year="numeric"
                                            value={row.attributes.updated_at}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
}

export default ConnectorsTable;
