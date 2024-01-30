import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TableIntlConfig, TableState } from 'types';
import {
    getColumnKeyList,
    getTableComponents,
    getEmptyTableHeader,
    getEmptyTableMessage,
} from 'utils/table-utils';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
import TableLoadingRows from '../Loading';
import { ColumnProps } from './types';

interface Props {
    columns: ColumnProps[];
    noExistingDataContentIds: TableIntlConfig;
    tableState: TableState;
    loading: boolean;
    rows: any;
    CustomBody?: any;
    enableDivRendering?: boolean;
}

function EntityTableBody({
    columns,
    loading,
    noExistingDataContentIds,
    rows,
    tableState,
    CustomBody,
    enableDivRendering,
}: Props) {
    const columnKeys = useMemo(() => {
        return getColumnKeyList(columns);
    }, [columns]);

    const hasRows = hasLength(rows);

    if (hasRows && CustomBody) {
        return <CustomBody />;
    }

    const {
        body: bodyComponent,
        cell: cellComponent,
        row: rowComponent,
    } = getTableComponents(enableDivRendering);

    return (
        <TableBody component={bodyComponent}>
            {hasRows ? (
                rows
            ) : loading ? (
                <TableLoadingRows
                    columnKeys={columnKeys}
                    enableDivRendering={enableDivRendering}
                />
            ) : (
                <TableRow component={rowComponent}>
                    <TableCell
                        colSpan={columnKeys.length}
                        component={cellComponent}
                    >
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

                                <Typography component="div" align="center">
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
