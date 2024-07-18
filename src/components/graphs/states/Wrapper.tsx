import { Box } from '@mui/material';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';
import { eChartsTooltipSX } from '../tooltips';

function GraphStateWrapper({ children }: BaseComponentProps) {
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

    if (billingStoreHydrated) {
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
