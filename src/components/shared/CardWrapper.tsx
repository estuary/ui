import type { ReactNode } from 'react';

import {
    Box,
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
    semiTransparentBackground,
} from 'src/context/Theme';
import type { BaseComponentProps } from 'src/types';

interface Props extends BaseComponentProps {
    message?: string | ReactNode;
    tooltipMessageId?: string;
    height?: string | number;
}

function CardWrapper({ children, height, message, tooltipMessageId }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Box
            sx={{
                ...eChartsTooltipSX,
                height,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                background: semiTransparentBackground[theme.palette.mode],
                boxShadow: defaultBoxShadow,
                borderRadius: 3,
                minWidth: 'min-content',
            }}
        >
            {Boolean(message || tooltipMessageId) ? (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, alignItems: 'center' }}
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
        </Box>
    );
}

export default CardWrapper;
