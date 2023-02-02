import { Skeleton, TableCell, TableRow } from '@mui/material';
import { useMemo } from 'react';
import { TableColumns } from 'types';

interface Props {
    columns: TableColumns[];
}

const emptyRowHeight = 80;

function TableLoadingRows({ columns }: Props) {
    const loadingRows = useMemo(() => {
        const styling = { height: emptyRowHeight };
        const loadingRow = columns.map((column, index) => {
            return (
                <TableCell key={`loading-${column.field}-${index}`}>
                    <Skeleton variant="rectangular" />
                </TableCell>
            );
        });

        return (
            <>
                <TableRow sx={styling}>{loadingRow}</TableRow>
                <TableRow sx={{ ...styling, opacity: '75%' }}>
                    {loadingRow}
                </TableRow>
                <TableRow sx={{ ...styling, opacity: '50%' }}>
                    {loadingRow}
                </TableRow>
                <TableRow
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
    }, [columns]);

    return loadingRows;
}

export default TableLoadingRows;
