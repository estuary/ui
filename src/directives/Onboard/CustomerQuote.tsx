import {
    Box,
    Card,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { QuoteSolid } from 'iconoir-react';
import { useIntl } from 'react-intl';
import customerLogo from 'images/FP-Logo_Wordmark_Pos_RGB.svg';

function CustomerQuote() {
    const theme = useTheme();
    const intl = useIntl();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    if (belowMd) {
        return null;
    } else {
        return (
            <Card
                color="secondary"
                elevation={0}
                sx={{
                    // backgroundColor: '#e5e5e6',
                    borderRadius: 10,
                    backgroundColor: 'action.selected',
                    opacity: 0.8,
                }}
            >
                <Stack
                    sx={{
                        alignItems: 'flex-start',
                        px: 3,
                    }}
                >
                    <Typography
                        color="primary"
                        sx={{
                            transform: 'rotate(180deg)',
                        }}
                    >
                        <QuoteSolid style={{ fontSize: 70 }} />
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#777b82',
                            fontSize: 30,
                            mt: 1,
                            pl: 1.5,
                        }}
                    >
                        {`"${intl.formatMessage({
                            id: 'tenant.customer.quote',
                        })}"`}
                    </Typography>
                    <Box
                        sx={{
                            mt: 3,
                        }}
                    >
                        <img
                            src={customerLogo}
                            height="36px"
                            width="100px"
                            alt={intl.formatMessage({ id: 'company' })}
                        />
                    </Box>
                </Stack>
            </Card>
        );
    }
}

export default CustomerQuote;
