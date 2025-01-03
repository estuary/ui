import { Grid, Stack, Typography, useTheme } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import { cardHeaderSx } from 'context/Theme';
import { MoreHoriz } from 'iconoir-react';
import { useIntl } from 'react-intl';
import ActivationDetail from './ActivationDetail';
import StatusIndicator from './StatusIndicator';
import TimestampDetail from './TimestampDetail';

export default function ControllerOverview() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Grid item xs={3}>
            <CardWrapper>
                <Stack spacing={2}>
                    <Stack
                        style={{
                            marginBottom: 8,
                        }}
                    >
                        <Stack
                            direction="row"
                            style={{
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography
                                component="div"
                                sx={{ ...cardHeaderSx, mr: 3 }}
                            >
                                {intl.formatMessage({
                                    id: 'details.ops.status.overview.controller.header',
                                })}
                            </Typography>

                            <Stack
                                style={{
                                    backgroundColor: '#F0F4F9',
                                    borderRadius: 4,
                                    height: 21,
                                    marginLeft: 4,
                                    paddingLeft: 3,
                                    paddingRight: 3,
                                }}
                            >
                                <MoreHoriz
                                    style={{
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </Stack>
                        </Stack>

                        <StatusIndicator />
                    </Stack>

                    <ActivationDetail headerMessageId="details.ops.status.overview.controller.subheaderActivation" />

                    <TimestampDetail headerMessageId="details.ops.status.overview.controller.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
