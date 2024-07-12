import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import useHideStatsColumnsSx from 'components/tables/hooks/useHideStatsColumnsSx';
import { semiTransparentBackgroundIntensified } from 'context/Theme';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatDocs } from './shared';

interface Props {
    read?: boolean;
    val?: number | null;
}

const Docs = ({ read, val }: Props) => {
    const intl = useIntl();
    const statsLoading = val === null;
    const defaultedVal = val ?? 0;
    const number = useMemo(() => formatDocs(defaultedVal), [defaultedVal]);

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
                    title={`${defaultedVal} ${intl.formatMessage({
                        id: read
                            ? 'entityTable.stats.docs_read'
                            : 'entityTable.stats.docs_written',
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

export default Docs;
