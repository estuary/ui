import type { EntityTableBodyProps } from 'src/components/tables/EntityTable/types';

import { useMemo } from 'react';

import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import TableLoadingRows from 'src/components/tables/Loading';
import {
    getColumnKeyList,
    getEmptyTableHeader,
    getEmptyTableMessage,
    getTableComponents,
} from 'src/utils/table-utils';

function EntityTableBody({
    columns,
    loading,
    noExistingDataContentIds,
    rows,
    tableState,
    enableDivRendering,
}: EntityTableBodyProps) {
    const intl = useIntl();

    const columnKeys = useMemo(() => {
        return getColumnKeyList(columns);
    }, [columns]);

    const { tbodyComponent, tdComponent, trComponent } =
        getTableComponents(enableDivRendering);

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
                                    {intl.formatMessage({
                                        id: getEmptyTableHeader(
                                            tableState.status,
                                            noExistingDataContentIds
                                        ),
                                    })}
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
