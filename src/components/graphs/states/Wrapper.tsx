import type { BaseComponentProps } from 'src/types';

import { Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

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
                header={
                    <FormattedMessage id="entityTable.networkFailed.header" />
                }
                message={
                    <FormattedMessage id="entityTable.networkFailed.message" />
                }
            />
        );
    }

    if (!isLoading) {
        return hasLength(billingHistory) ? (
            <Box sx={eChartsTooltipSX}>{children}</Box>
        ) : (
            <EmptyGraphState
                message={
                    <FormattedMessage id="admin.billing.table.history.emptyTableDefault.message" />
                }
            />
        );
    }

    return <GraphLoadingState />;
}

export default GraphStateWrapper;
