import { Box, LinearProgress, TableCell, Typography } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import readable from 'readable-numbers';

interface Props {
    val?: number | null;
}

const Docs = ({ val }: Props) => {
    const number = readable(val ?? 111156789);

    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Typography>{number} docs</Typography>
                {val === null ? <LinearProgress color="inherit" /> : null}
            </Box>
        </TableCell>
    );
};

export default Docs;
