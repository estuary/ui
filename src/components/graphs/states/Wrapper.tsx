import type { BaseComponentProps } from 'src/types';

import { Box } from '@mui/material';

import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import { eChartsTooltipSX } from 'src/components/graphs/tooltips';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { USAGE_GRAPH_MONTHS } from 'src/utils/billing-utils';
import { hasLength } from 'src/utils/misc-utils';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const { invoices: billingHistory, isLoading } = useBillingInvoices({
        months: USAGE_GRAPH_MONTHS,
    });

    if (!isLoading) {
        return hasLength(billingHistory) ? (
            <Box sx={eChartsTooltipSX}>{children}</Box>
        ) : (
            <EmptyGraphState
                message={"We couldn't find any billing information on file."}
            />
        );
    }

    return <GraphLoadingState />;
}

export default GraphStateWrapper;
