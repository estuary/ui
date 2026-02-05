import { Grid } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useBillingStore } from 'src/stores/Billing/Store';

function BillingLoadError() {
    const hydrationErrorsExist = useBillingStore(
        (state) => state.hydrationErrorsExist
    );

    if (!hydrationErrorsExist) {
        return null;
    }

    return (
        <Grid size={{ xs: 12 }}>
            <AlertBox
                short
                severity="warning"
                title={
                    <FormattedMessage id="admin.billing.error.details.header" />
                }
            >
                <FormattedMessage id="admin.billing.error.details.message" />
            </AlertBox>
        </Grid>
    );
}

export default BillingLoadError;
