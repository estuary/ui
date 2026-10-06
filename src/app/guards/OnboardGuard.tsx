import type { UserInfoStore } from 'src/context/UserInfoSummary/types';

import { Grid, useMediaQuery, useTheme } from '@mui/material';

import FullPageWrapper from 'src/app/FullPageWrapper';
import { CustomerQuote } from 'src/components/onboarding/CustomerQuote';
import TenantCreate from 'src/components/onboarding/TenantCreate';

interface Props {
    grantsMutate: UserInfoStore['mutate'];
}

function OnboardGuard({ grantsMutate }: Props) {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <FullPageWrapper fullWidth>
            <Grid
                container
                sx={{
                    p: 2,
                }}
            >
                {aboveMd ? (
                    <Grid size={{ xs: 0, md: 6 }}>
                        <CustomerQuote />
                    </Grid>
                ) : null}
                <Grid size={{ xs: 12, md: 6 }}>
                    <TenantCreate mutate={grantsMutate} />
                </Grid>
            </Grid>
        </FullPageWrapper>
    );
}

export default OnboardGuard;
