import { Box } from '@mui/material';
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
            <Box
                sx={{
                    '& .tooltipTitle': {
                        marginBottom: '0.5rem',
                    },
                    '& .tooltipItem': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                    },
                    '& .tooltipDataValue': {
                        marginLeft: '20px',
                        fontWeight: 600,
                    },
                }}
            >
                {children}
            </Box>
        ) : (
            <EmptyGraphState />
        );
    } else {
        return <GraphLoadingState />;
    }
}

export default GraphStateWrapper;
