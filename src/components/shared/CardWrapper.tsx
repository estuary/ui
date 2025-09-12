import type { CardWrapperProps } from 'src/components/shared/types';

import {
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { eChartsTooltipSX } from 'src/components/graphs/tooltips';
import {
    cardHeaderSx,
    defaultBoxShadow,
    intensifiedOutline,
    semiTransparentBackground,
} from 'src/context/Theme';

function CardWrapper({
    children,
    height,
    message,
    tooltipMessageId,
    disableElevation,
    sx,
}: CardWrapperProps) {
    const intl = useIntl();
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Stack
            sx={{
                ...eChartsTooltipSX,
                height,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                // ? `5px solid ${semiTransparentBackgroundIntensified[theme.palette.mode]}`
                borderLeft: disableElevation
                    ? intensifiedOutline[theme.palette.mode]
                    : undefined,
                borderLeftWidth: 5,
                background: semiTransparentBackground[theme.palette.mode],
                boxShadow: disableElevation ? undefined : defaultBoxShadow,
                borderRadius: 3,
                minWidth: 'min-content',
                rowGap: 2,
                ...((sx as any) ?? {}),
            }}
        >
            {Boolean(message || tooltipMessageId) ? (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    {message ? (
                        <Typography
                            sx={{
                                ...cardHeaderSx,
                                mb: 2,
                                width: '100%',
                            }}
                            component="div"
                        >
                            {message}
                        </Typography>
                    ) : null}

                    {tooltipMessageId ? (
                        <Tooltip
                            placement={belowLg ? 'bottom' : 'right'}
                            title={intl.formatMessage({
                                id: 'admin.billing.graph.dataByTask.tooltip',
                            })}
                        >
                            <HelpCircle
                                style={{
                                    marginBottom: 16,
                                    fontSize: 12,
                                    strokeWidth: 1,
                                    color: theme.palette.text.primary,
                                }}
                            />
                        </Tooltip>
                    ) : null}
                </Stack>
            ) : null}

            {children}
        </Stack>
    );
}

export default CardWrapper;
