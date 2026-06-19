import type { BaseComponentProps } from 'src/types';

import { Box } from '@mui/material';

import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import { eChartsTooltipSX } from 'src/components/graphs/tooltips';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { hasLength } from 'src/utils/misc-utils';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const {
        invoices: billingHistory,
        isLoading,
        networkFailed,
    } = useBillingInvoices();

    if (networkFailed) {
        return (
            <EmptyGraphState
                header="There was a network issue."
                message="Please check your internet connection and reload the application."
            />
        );
    }

    if (!isLoading) {
        return hasLength(billingHistory) ? (
            <Box sx={eChartsTooltipSX}>{children}</Box>
        ) : (
            <EmptyGraphState message="We couldn't find any billing information on file. Only administrators of a tenant are able to review billing information." />
        );
    }

    return <GraphLoadingState />;
}

export default GraphStateWrapper;
