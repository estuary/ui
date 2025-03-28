import { Box } from '@mui/material';
import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'src/stores/Billing/Store';
import { BaseComponentProps } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import { eChartsTooltipSX } from '../tooltips';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const billingStoreActive = useBillingStore((state) => state.active);
    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const networkFailed = useBillingStore((state) => state.networkFailed);
    const billingHistory = useBillingStore((state) => state.invoices);

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

    if (!billingStoreActive && billingStoreHydrated) {
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
