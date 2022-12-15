import { Box, LinearProgress, TableCell, Typography } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import { FormattedNumber } from 'react-intl';

interface Props {
    val?: number | null;
}

const Docs = ({ val }: Props) => {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Typography>
                    <FormattedNumber value={val ?? 0} />
                </Typography>
                {val === null ? <LinearProgress color="inherit" /> : null}
            </Box>
        </TableCell>
    );
};

export default Docs;
