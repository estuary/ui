import { useIntl } from 'react-intl';

import { Box, TableCell, Tooltip, Typography } from '@mui/material';

interface Props {
    volumeInGB: number;
}

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
