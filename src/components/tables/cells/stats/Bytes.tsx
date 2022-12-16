import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import {
    semiTransparentBackgroundIntensified,
    tableBorderSx,
} from 'context/Theme';
import prettyBytes from 'pretty-bytes';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    read?: boolean;
    val?: number | null;
}

// TODO (stats) we can combine this with the Docs component.
const Bytes = ({ read, val }: Props) => {
    const intl = useIntl();
    const statsLoading = val === null;
    const defaultedVal = val ?? 0;
    const number = useMemo(
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
                ...tableBorderSx,
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={`${defaultedVal} ${intl.formatMessage({
                        id: read
                            ? 'entityTable.stats.bytes_read'
                            : 'entityTable.stats.bytes_written',
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
                        {number}
                    </Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default Bytes;
