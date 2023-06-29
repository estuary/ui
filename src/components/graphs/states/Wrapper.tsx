import { Box } from '@mui/material';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import { FormattedMessage } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_dataByTaskGraphDetails,
    useBilling_hydrated,
} from 'stores/Billing/hooks';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';
import { tooltipSX } from '../tooltips';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const billingStoreHydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();
    const dataByTaskGraphDetails = useBilling_dataByTaskGraphDetails();

    if (billingStoreHydrated) {
        return hasLength(billingHistory) &&
            hasLength(dataByTaskGraphDetails) ? (
            <Box sx={tooltipSX}>{children}</Box>
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
