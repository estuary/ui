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
                // A hairline rather than a drop shadow.
                //
                // The old shadow stacked three layers, one of which cast
                // *upward* — light from two directions at once, which is what
                // made it read as dated. It was also doing redundant work in
                // light mode, where a white card already separates from the
                // #F7F9FC page, and no work at all in dark, where a 10%-black
                // shadow on a near-black page is invisible.
                //
                // `palette.divider` specifically, because that is what the stat
                // cards inside this one already use. The page was nesting
                // bordered cards inside shadowed ones — two elevation languages,
                // one inside the other.
                border: `1px solid ${theme.palette.divider}`,
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
