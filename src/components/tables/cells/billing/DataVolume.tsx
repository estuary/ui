import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import { semiTransparentBackgroundIntensified } from 'context/Theme';
import prettyBytes from 'pretty-bytes';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    val?: number | null;
}

const DataVolume = ({ val }: Props) => {
    const intl = useIntl();

    const statsLoading = val === null;
    const defaultedVal = val ?? 0;

    const formattedBytes = useMemo(
        () =>
            prettyBytes(defaultedVal, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        [defaultedVal]
    );

    return (
        <TableCell
            sx={{
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={`${defaultedVal} ${intl.formatMessage({
                        id: 'admin.billing.projectedCostTable.tooltip.dataVolume',
                    })}`}
                >
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
                        {formattedBytes}
                    </Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default DataVolume;
