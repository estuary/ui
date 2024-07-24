import { Stack, Typography } from '@mui/material';
import { defaultBoxShadow, semiTransparentBackground } from 'context/Theme';
import { useUserStore } from 'context/User/useUserContextStore';
import { FormattedMessage } from 'react-intl';
import { useShallow } from 'zustand/react/shallow';

export default function GreetingBanner() {
    const userName = useUserStore(
        useShallow((state) => state.userDetails?.userName)
    );

    return (
        <Stack
            spacing={1}
            sx={{
                p: 2,
                background: (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                boxShadow: defaultBoxShadow,
                borderRadius: 3,
            }}
        >
            <Typography variant="h6">
                <FormattedMessage
                    id={
                        userName
                            ? 'home.dashboard.greetingBanner.title'
                            : 'home.dashboard.greetingBanner.title.fallback'
                    }
                    values={{ userName }}
                />
            </Typography>

            <Typography>
                <FormattedMessage id="home.dashboard.greetingBanner.message" />
            </Typography>
        </Stack>
    );
}
