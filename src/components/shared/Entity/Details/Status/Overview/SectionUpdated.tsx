import { Box, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

export default function SectionUpdated() {
    const intl = useIntl();

    const lastUpdated = useEntityStatusStore((state) => state.lastUpdated);

    return (
        <Grid size={{ xs: 12 }}>
            {lastUpdated ? (
                <Stack direction="row" style={{ justifyContent: 'flex-end' }}>
                    <Typography
                        sx={{
                            color: (theme) =>
                                diminishedTextColor[theme.palette.mode],
                        }}
                        variant="caption"
                    >
                        {intl.formatMessage(
                            {
                                id: 'details.ops.status.message.lastUpdated',
                            },
                            {
                                timestamp: `${lastUpdated.toLocaleString({
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    timeZoneName: 'short',
                                })}, ${lastUpdated.toLocaleString({
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}`,
                            }
                        )}
                    </Typography>
                </Stack>
            ) : (
                <Box style={{ height: 20 }} />
            )}
        </Grid>
    );
}
