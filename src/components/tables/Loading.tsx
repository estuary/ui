import { Skeleton, TableCell, TableRow } from '@mui/material';
import { useMemo } from 'react';
import { getTableComponents } from 'src/utils/table-utils';

interface Props {
    columnKeys: string[];
    enableDivRendering?: boolean;
    singleRow?: boolean;
}

const styling = { height: 45 };

function TableLoadingRows({
    columnKeys,
    enableDivRendering,
    singleRow,
}: Props) {
    const loadingRows = useMemo(() => {
        const { tdComponent, trComponent } =
            getTableComponents(enableDivRendering);

        const loadingRow = columnKeys.map((columnKey, index) => (
            <TableCell
                key={`loading-${columnKey}__-${index}`}
                component={tdComponent}
            >
                <Skeleton variant="rectangular" />
            </TableCell>
        ));

        if (singleRow) {
            return (
                <TableRow component={trComponent} sx={styling}>
                    {loadingRow}
                </TableRow>
            );
        }

        return (
            <>
                <TableRow component={trComponent} sx={styling}>
                    {loadingRow}
                </TableRow>

                <TableRow
                    component={trComponent}
                    sx={{ ...styling, opacity: '75%' }}
                >
                    {loadingRow}
                </TableRow>

                <TableRow
                    component={trComponent}
                    sx={{ ...styling, opacity: '50%' }}
                >
                    {loadingRow}
                </TableRow>

                <TableRow
                    component={trComponent}
                    sx={{
                        ...styling,
                        'opacity': '25%',
                        '& .MuiTableCell-root': {
                            borderBottom: 'transparent',
                        },
                    }}
                >
                    {loadingRow}
                </TableRow>
            </>
        );
    }, [columnKeys, enableDivRendering, singleRow]);

    return loadingRows;
}

export default TableLoadingRows;
