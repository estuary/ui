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
import Empty from 'components/tables/Captures/Empty';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from 'supabase-swr';

interface Discovers {
    'capture_name': string;
    'updated_at': string;
    'job_status->>type': string;
    'id': string;
}

const DISCOVERS_QUERY = `
    capture_name, 
    updated_at, 
    job_status->>type, 
    id
`;

const columns = ['data.name', 'data.status', 'data.updated_at'];

const columnStyling = {
    maxWidth: '20%',
    textOverflow: 'ellipsis',
    width: '20%',
};

function CapturesTable() {
    const tagsQuery = useQuery<Discovers>(
        TABLES.DISCOVERS,
        {
            columns: DISCOVERS_QUERY,
            filter: (query) => query.eq('job_status->>type', 'success'),
        },
        []
    );
    const { data: discovers, error } = useSelect(tagsQuery, {});

    const intl = useIntl();

    return (
        <Box>
            <Typography>
                <FormattedMessage id="capturesTable.title" />
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
                                        key={`${column}-${index}`}
                                        style={columnStyling}
                                    >
                                        <FormattedMessage id={column} />
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discovers ? (
                            discovers.data.length > 0 ? (
                                discovers.data.map(
                                    (row: any, index: number) => (
                                        <TableRow
                                            key={`Capture-${row.id}-${index}`}
                                        >
                                            <TableCell style={columnStyling}>
                                                {row.capture_name}
                                            </TableCell>
                                            <TableCell style={columnStyling}>
                                                {row.job_status}
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
                                    )
                                )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        align="center"
                                    >
                                        <Empty />
                                    </TableCell>
                                </TableRow>
                            )
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <Error error={error} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default CapturesTable;
