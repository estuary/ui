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
    opaqueLightModeBackground,
    semiTransparentBackground,
} from 'src/context/Theme';

function CardWrapper({
    children,
    disableMinWidth,
    opaqueLightMode,
    height,
    message,
    sx,
    tooltipMessageId,
}: CardWrapperProps) {
    const intl = useIntl();
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

    // A divider hairline rather than a drop shadow. The old shadow stacked
    // three layers, one of them casting upward, and did redundant work in light
    // mode while being invisible in dark.
    //
    // Light mode only, at review request. Dark mode separates the card from the
    // panel by tone already — the card carries a 5% white wash over grey[800] —
    // so a border there is a second separator doing the first one's job. Light
    // mode has no such wash: its card is white on grey[100], a much narrower
    // step, and the border is what makes the edge legible.
    return (
        <Stack
            sx={{
                ...eChartsTooltipSX,
                height,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                rowGap: 2,
                minWidth: disableMinWidth ? undefined : 'min-content',
                background: opaqueLightMode
                    ? opaqueLightModeBackground[theme.palette.mode]
                    : semiTransparentBackground[theme.palette.mode],
                border:
                    theme.palette.mode === 'light'
                        ? `1px solid ${theme.palette.divider}`
                        : 'none',
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
