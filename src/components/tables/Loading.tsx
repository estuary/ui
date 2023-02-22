import { Skeleton, TableCell, TableRow } from '@mui/material';
import { useMemo } from 'react';
import { TableColumns } from 'types';

interface Props {
    columns: TableColumns[];
    singleRow?: boolean;
}

const styling = { height: 45 };

function TableLoadingRows({ columns, singleRow }: Props) {
    const loadingRows = useMemo(() => {
        const loadingRow = columns.map((column, index) => {
            return (
                <TableCell key={`loading-${column.field}-${index}`}>
                    <Skeleton variant="rectangular" />
                </TableCell>
            );
        });

        if (singleRow) {
            return <TableRow sx={styling}>{loadingRow}</TableRow>;
        }

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
    }, [columns, singleRow]);

    return loadingRows;
}

export default TableLoadingRows;
