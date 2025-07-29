import { Stack, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import ChiliDarkMode from 'src/images/register/chili_darkmode.png';
import ChiliLightMode from 'src/images/register/chili_lightmode.png';
import CoalesceDarkMode from 'src/images/register/coalesce_darkmode.png';
import CoalesceLightMode from 'src/images/register/coalesce_lightmode.png';
import RecartDarkMode from 'src/images/register/recart_darkmode.png';
import RecartLightMode from 'src/images/register/recart_lightmode.png';
import ResendDarkMode from 'src/images/register/resend_darkmode.png';
import ResendLightMode from 'src/images/register/resend_lightmode.png';
import XometryDarkMode from 'src/images/register/xometry_darkmode.png';
import XometryLightMode from 'src/images/register/xometry_lightmode.png';

const customers = [
    {
        altMessageId: 'login.register.alt.coalesce',
        logo: {
            light: CoalesceLightMode,
            dark: CoalesceDarkMode,
        },
    },
    {
        altMessageId: 'login.register.alt.resend',
        logo: {
            light: ResendLightMode,
            dark: ResendDarkMode,
        },
    },
    {
        altMessageId: 'login.register.alt.xometry',
        height: 23,
        logo: {
            light: XometryLightMode,
            dark: XometryDarkMode,
        },
    },
    {
        altMessageId: 'login.register.alt.recart',
        logo: {
            light: RecartLightMode,
            dark: RecartDarkMode,
        },
    },
    {
        altMessageId: 'login.register.alt.chili',
        logo: {
            light: ChiliLightMode,
            dark: ChiliDarkMode,
        },
    },
];

function CustomerLogos() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                'width': '100%',
                'flexWrap': 'wrap',
                'justifyContent': 'space-evenly',
                '& img': {
                    width: 'auto',
                },
            }}
        >
            {customers.map((customer, index) => {
                return (
                    <img
                        key={`customers_${index}`}
                        height={customer.height ?? 27}
                        src={customer.logo[theme.palette.mode]}
                        alt={intl.formatMessage({
                            id: customer.altMessageId,
                        })}
                    />
                );
            })}
        </Stack>
    );
}

export default CustomerLogos;
