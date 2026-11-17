import { Box, TableCell, Tooltip, Typography } from '@mui/material';

interface Props {
    volumeInGB: number;
}

const DataVolume = ({ volumeInGB }: Props) => {
    return (
        <TableCell
            sx={{
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={`${volumeInGB.toFixed(4)} GB of data processed by tasks`}
                >
                    <Typography>{`${volumeInGB.toFixed(2)} GB`}</Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default DataVolume;
