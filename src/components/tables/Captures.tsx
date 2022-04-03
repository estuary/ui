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
import ExternalLink from 'components/shared/ExternalLink';
import useSupabase from 'hooks/useSupabase';
import { isEmpty } from 'lodash';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { supabase } from 'services/supabase';

const capturesQuery = () => {
    // TODO (supabase) - this is not the actual query... we need to get a list of captures
    return supabase
        .from('discovers')
        .select(`capture_name, updated_at, job_status, id`)
        .order('updated_at', { ascending: false });

    // TODO (supabase) - how do we order by the image name here?
};

function CapturesTable() {
    const { data, isLoading, isSuccess, error } = useSupabase(capturesQuery);

    const intl = useIntl();

    const columns = [
        {
            field: 'attributes.capture_name',
            headerIntlKey: 'data.name',
        },
        {
            field: 'attributes.job_status',
            headerIntlKey: 'data.status',
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
                                    <Error error={error} />
                                </TableCell>
                            </TableRow>
                        ) : isSuccess && !isEmpty(data) ? (
                            data.map((row: any, index: number) => (
                                <TableRow key={`Capture-${row.id}-${index}`}>
                                    <TableCell style={columnStyling}>
                                        {row.capture_name}
                                    </TableCell>
                                    <TableCell style={columnStyling}>
                                        {row.job_status.type}
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
                                    <Box
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            height: 250,
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: 150,
                                                padding: 2,
                                                textAlign: 'center',
                                                width: '90%',
                                            }}
                                        >
                                            <Typography
                                                gutterBottom
                                                variant="h5"
                                                component="div"
                                            >
                                                <FormattedMessage id="captures.main.message1" />
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                color="text.secondary"
                                            >
                                                <FormattedMessage
                                                    id="captures.main.message2"
                                                    values={{
                                                        docLink: (
                                                            <ExternalLink
                                                                link={intl.formatMessage(
                                                                    {
                                                                        id: 'captures.main.message2.docPath',
                                                                    }
                                                                )}
                                                            >
                                                                <FormattedMessage id="captures.main.message2.docLink" />
                                                            </ExternalLink>
                                                        ),
                                                    }}
                                                />
                                            </Typography>
                                        </Box>
                                    </Box>
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
