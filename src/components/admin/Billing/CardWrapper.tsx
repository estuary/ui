import {
    Box,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { defaultBoxShadow, semiTransparentBackground } from 'context/Theme';
import { HelpCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BaseComponentProps } from 'types';
import { TOTAL_CARD_HEIGHT } from 'utils/billing-utils';

interface Props extends BaseComponentProps {
    messageId: string;
    tooltipMessageId?: string;
}

function CardWrapper({ children, messageId, tooltipMessageId }: Props) {
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

    const intl = useIntl();

    return (
        <Box
            sx={{
                height: TOTAL_CARD_HEIGHT,
                p: 2,
                background: semiTransparentBackground[theme.palette.mode],
                boxShadow: defaultBoxShadow,
                borderRadius: 3,
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ mb: 2, fontSize: 16, fontWeight: 300 }}>
                    <FormattedMessage id={messageId} />
                </Typography>

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

            {children}
        </Box>
    );
}

export default CardWrapper;
