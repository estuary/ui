import { TableIntlConfig, TableState } from 'types';
import { FormattedMessage } from 'react-intl';

import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';

import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';

import TableLoadingRows from '../Loading';
import { ColumnProps } from './types';

interface Props {
    columns: ColumnProps[];
    noExistingDataContentIds: TableIntlConfig;
    tableState: TableState;
    loading: boolean;
    rows: any;
}

function EntityTableBody({
    columns,
    loading,
    noExistingDataContentIds,
    rows,
    tableState,
}: Props) {
    return (
        <TableBody>
            {rows ? (
                rows
            ) : loading ? (
                <TableLoadingRows columns={columns} />
            ) : (
                <TableRow>
                    <TableCell colSpan={columns.length}>
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Box width={450}>
                                <Typography
                                    variant="subtitle2"
                                    align="center"
                                    sx={{ mb: 1 }}
                                >
                                    <FormattedMessage
                                        id={getEmptyTableHeader(
                                            tableState.status,
                                            noExistingDataContentIds
                                        )}
                                    />
                                </Typography>

                                <Typography component="div">
                                    {getEmptyTableMessage(
                                        tableState.status,
                                        noExistingDataContentIds
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
}

export default EntityTableBody;
