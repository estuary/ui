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
import Rows from 'components/tables/Captures/Rows';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';

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

    console.log('capture table', discovers);

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
                        {discovers?.data ? (
                            discovers.data.length > 0 ? (
                                <Rows
                                    discovers={discovers.data}
                                    styling={columnStyling}
                                />
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
