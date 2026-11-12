import { Grid, useMediaQuery, useTheme } from '@mui/material';

import { Branch } from 'react-semantic-tree';

import FullPageWrapper from 'src/app/FullPageWrapper';
import { CustomerQuote } from 'src/components/onboarding/CustomerQuote';
import { TenantCreate } from 'src/components/onboarding/TenantCreate';

export function OnboardingPage() {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <FullPageWrapper fullWidth>
            <Branch label="Tenant Onboarding">
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
                        <TenantCreate />
                    </Grid>
                </Grid>
            </Branch>
        </FullPageWrapper>
    );
}
