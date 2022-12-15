import { Box, LinearProgress, TableCell, Typography } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import prettyBytes from 'pretty-bytes';

interface Props {
    val?: number | null;
}

const Bytes = ({ val }: Props) => {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Typography
                    sx={{
                        maxWidth: 'max-content',
                    }}
                >
                    {prettyBytes(val ?? 0, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </Typography>
                {val === null ? <LinearProgress color="inherit" /> : null}
            </Box>
        </TableCell>
    );
};

export default Bytes;
