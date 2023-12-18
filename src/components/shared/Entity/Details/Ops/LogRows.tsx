import ReactJson from '@microlink/react-json-view';
import { TableCell, TableRow, Typography, useTheme } from '@mui/material';
import { jsonViewTheme } from 'context/Theme';

interface RowProps {
    row: any;
}

interface RowsProps {
    data: any[];
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    return (
        <TableRow
            hover
            onClick={() => {
                console.log('expand code goes here');
            }}
        >
            <TableCell sx={{ maxWidth: 'min-content' }}>
                <Typography
                    sx={{ fontFamily: 'Monospace', textWrap: 'nowrap' }}
                >
                    {row.level}
                </Typography>
            </TableCell>

            <TableCell sx={{ maxWidth: 'min-content' }}>
                <Typography
                    sx={{
                        fontFamily: 'Monospace',
                        textWrap: 'nowrap',
                    }}
                >
                    {row.ts}
                </Typography>
            </TableCell>

            <TableCell sx={{ maxWidth: 'min-content' }}>
                <Typography
                    sx={{ fontFamily: 'Monospace', textWrap: 'nowrap' }}
                >
                    {row.message}
                </Typography>
            </TableCell>

            <TableCell>
                <ReactJson
                    style={{ wordBreak: 'break-all' }}
                    quotesOnKeys={false}
                    src={row.fields ?? {}}
                    theme={jsonViewTheme[theme.palette.mode]}
                    collapsed
                    displayObjectSize={false}
                    displayDataTypes={false}
                />
            </TableCell>
        </TableRow>
    );
}

function LogRows({ data }: RowsProps) {
    return (
        <>
            {data.map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default LogRows;
