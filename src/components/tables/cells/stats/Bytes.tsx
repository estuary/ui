import { Box, TableCell, Typography } from '@mui/material';
import {
    semiTransparentBackgroundIntensified,
    tableBorderSx,
} from 'context/Theme';
import prettyBytes from 'pretty-bytes';

interface Props {
    val?: number | null;
}

const Bytes = ({ val }: Props) => {
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
                    {prettyBytes(val ?? 0, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </Typography>
            </Box>
        </TableCell>
    );
};

export default Bytes;
