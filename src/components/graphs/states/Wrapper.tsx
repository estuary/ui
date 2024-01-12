import { Box } from '@mui/material';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import { FormattedMessage } from 'react-intl';
import {
    useBilling_dataByTaskGraphDetails,
    useBilling_hydrated,
    useBilling_invoices,
    useBilling_networkFailed,
} from 'stores/Billing/hooks';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';
import { eChartsTooltipSX } from '../tooltips';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const billingStoreHydrated = useBilling_hydrated();
    const networkFailed = useBilling_networkFailed();
    const billingHistory = useBilling_invoices();
    const dataByTaskGraphDetails = useBilling_dataByTaskGraphDetails();

    if (networkFailed) {
        return (
            <EmptyGraphState
                headerKey="entityTable.networkFailed.header"
                message={
                    <FormattedMessage id="entityTable.networkFailed.message" />
                }
            />
        );
    } else if (billingStoreHydrated) {
        return hasLength(billingHistory) &&
            hasLength(dataByTaskGraphDetails) ? (
            <Box sx={eChartsTooltipSX}>{children}</Box>
        ) : (
            <EmptyGraphState
                message={
                    <FormattedMessage id="admin.billing.table.history.emptyTableDefault.message" />
                }
            />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default GraphStateWrapper;
