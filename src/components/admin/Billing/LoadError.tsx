import { Grid } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';

function BillingLoadError() {
    const hydrationErrorsExist = useBillingStore(
        (state) => state.hydrationErrorsExist
    );

    if (!hydrationErrorsExist) {
        return null;
    }

    return (
        <Grid item xs={12}>
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
