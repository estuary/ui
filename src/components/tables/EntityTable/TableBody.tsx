import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { TableIntlConfig, TableState } from 'types';
import {
    getColumnKeyList,
    getEmptyTableHeader,
    getEmptyTableMessage,
    getTableComponents,
} from 'utils/table-utils';
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

    const { tbodyComponent, tdComponent, trComponent } =
        getTableComponents(enableDivRendering);

    if (rows && CustomBody) {
        return <CustomBody />;
    }

    return (
        <TableBody component={tbodyComponent}>
            {loading ? (
                <TableLoadingRows
                    columnKeys={columnKeys}
                    enableDivRendering={enableDivRendering}
                />
            ) : rows ? (
                rows
            ) : (
                <TableRow component={trComponent}>
                    <TableCell
                        colSpan={columnKeys.length}
                        component={tdComponent}
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
