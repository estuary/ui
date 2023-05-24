import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    volumeInGB: number;
}

// TODO (stats) we can combine this with the Docs component.
const DataVolume = ({ volumeInGB }: Props) => {
    const intl = useIntl();

    return (
        <TableCell
            sx={{
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={`${volumeInGB.toFixed(4)} ${intl.formatMessage({
                        id: 'admin.billing.table.history.tooltip.dataVolume',
                    })}`}
                >
                    <Typography>{`${volumeInGB.toFixed(2)} GB`}</Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default DataVolume;
