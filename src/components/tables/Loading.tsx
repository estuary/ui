import { Skeleton, TableCell, TableRow } from '@mui/material';
import { useMemo } from 'react';

interface Props {
    columnKeys: string[];
    singleRow?: boolean;
}

const styling = { height: 45 };

function TableLoadingRows({ columnKeys, singleRow }: Props) {
    const loadingRows = useMemo(() => {
        const loadingRow = columnKeys.map((columnKey, index) => (
            <TableCell key={`loading-${columnKey}__-${index}`}>
                <Skeleton variant="rectangular" />
            </TableCell>
        ));

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
    }, [columnKeys, singleRow]);

    return loadingRows;
}

export default TableLoadingRows;
