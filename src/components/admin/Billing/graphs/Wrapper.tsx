import EmptyGraphState from 'components/admin/Billing/graphs/states/Empty';
import GraphLoadingState from 'components/admin/Billing/graphs/states/Loading';
import {
    useBilling_billingHistory,
    useBilling_dataByTaskGraphDetails,
    useBilling_hydrated,
} from 'stores/Billing/hooks';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

function GraphStateWrapper({ children }: BaseComponentProps) {
    const billingStoreHydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();
    const dataByTaskGraphDetails = useBilling_dataByTaskGraphDetails();

    if (billingStoreHydrated) {
        return hasLength(billingHistory) &&
            hasLength(dataByTaskGraphDetails) ? (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>{children}</>
        ) : (
            <EmptyGraphState />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default GraphStateWrapper;
