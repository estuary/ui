import AlertBox from 'src/components/shared/AlertBox';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';

function BillingLoadError() {
    const { errorExists } = useBillingInvoices();

    if (!errorExists) {
        return null;
    }

    return (
        <AlertBox short severity="warning" title="There was a network issue.">
            There was an error fetching your billing details. Try again and if
            the issue persists please contact support.
        </AlertBox>
    );
}

export default BillingLoadError;
