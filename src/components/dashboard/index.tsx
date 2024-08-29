import { Box, Grid } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import TenantSelector from 'components/shared/TenantSelector';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import { FormattedMessage } from 'react-intl';
import EntityStatOverview from './EntityStatOverview';

export default function Dashboard() {
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    return (
        <Grid container spacing={{ xs: 2 }} style={{ marginTop: 16 }}>
            <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                <Box style={{ width: 300 }}>
                    <TenantSelector />
                </Box>
            </Grid>

            {hasSupportRole ? (
                <Grid item xs={12}>
                    <AlertBox severity="warning" short>
                        <FormattedMessage id="dashboard.alert.supportRoleTimeouts" />
                    </AlertBox>
                </Grid>
            ) : null}

            <EntityStatOverview />
        </Grid>
    );
}
