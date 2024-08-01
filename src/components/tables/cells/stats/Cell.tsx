import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import useHideStatsColumnsSx from 'components/tables/hooks/useHideStatsColumnsSx';
import { textloadingColor } from 'context/Theme';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { StatsCellProps } from './types';

const StatsCell = ({
    failed,
    formatter,
    read,
    statType,
    val,
}: StatsCellProps) => {
    const intl = useIntl();
    const statsLoading = val === null;
    const defaultedVal = val ?? 0;
    const number = useMemo(
        () => formatter(defaultedVal),
        [defaultedVal, formatter]
    );
    const hideColumnsSx = useHideStatsColumnsSx();

    return (
        <TableCell
            sx={{
                ...hideColumnsSx,
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={
                        failed
                            ? intl.formatMessage({
                                  id: 'entityTable.stats.error',
                              })
                            : `${defaultedVal} ${intl.formatMessage({
                                  id: read
                                      ? `entityTable.stats.${statType}_read`
                                      : `entityTable.stats.${statType}_written`,
                              })}`
                    }
                >
                    <Typography
                        sx={{
                            transitionDelay: statsLoading ? '800ms' : '0ms',
                            color: (theme) =>
                                // failed
                                //     ? theme.palette.error[theme.palette.mode]
                                //     :
                                statsLoading
                                    ? textloadingColor[theme.palette.mode]
                                    : null,
                            opacity: failed ? 0.4 : 1,
                        }}
                    >
                        {number}
                    </Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default StatsCell;
