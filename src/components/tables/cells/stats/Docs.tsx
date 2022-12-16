import { Box, TableCell, Typography } from '@mui/material';
import {
    semiTransparentBackgroundIntensified,
    tableBorderSx,
} from 'context/Theme';
import readable from 'readable-numbers';

interface Props {
    val?: number | null;
}

const Docs = ({ val }: Props) => {
    const number = readable(val ?? 0);
    const statsLoading = val === null;

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
                        transitionDelay: statsLoading ? '800ms' : '0ms',
                        color: (theme) =>
                            statsLoading
                                ? semiTransparentBackgroundIntensified[
                                      theme.palette.mode
                                  ]
                                : null,
                    }}
                >
                    {number} docs
                </Typography>
            </Box>
        </TableCell>
    );
};

export default Docs;
