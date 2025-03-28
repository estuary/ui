import { useMemo } from 'react';

import { Box, TableCell, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import useHideStatsColumnsSx from 'src/components/tables/hooks/useHideStatsColumnsSx';
import { textLoadingColor } from 'src/context/Theme';
import type { StatsCellProps } from 'src/components/tables/cells/stats/types';

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
                                statsLoading
                                    ? textLoadingColor[theme.palette.mode]
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
