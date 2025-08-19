import type { ActiveAlertsProps } from 'src/components/tables/AlertHistory/types';
import type { ActiveAlertsQueryResponse, AlertsVariables } from 'src/types/gql';

import { Box, IconButton, LinearProgress, Stack } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql, useQuery } from 'urql';

import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import AlertTypeContent from 'src/components/tables/AlertHistory/AlertTypeContent';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const testQuery = gql<ActiveAlertsQueryResponse, AlertsVariables>`
    query ActiveAlertsQuery($prefixes: [String!]!) {
        alerts(prefixes: $prefixes) {
            alertType
            alertDetails: arguments
            catalogName
            firedAt
            resolvedAt
        }
    }
`;

function ActiveAlerts({}: ActiveAlertsProps) {
    const intl = useIntl();
    console.log('intl', intl);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [{ fetching, data, error }] = useQuery({
        query: testQuery,
        variables: { prefixes: [catalogName] },
        pause: !catalogName,
    });

    if (fetching) {
        return <LinearProgress />;
    }

    if (error) {
        return (
            <AlertBox
                short
                title="failed to fetch active alerts"
                severity="error"
            />
        );
    }

    if (!data?.alerts || data.alerts.length === 0) {
        return null;
    }

    if (data.alerts.length === 0) {
        return <Box>No active alerts</Box>;
    }

    return (
        <Stack direction="row" spacing={2}>
            {data.alerts.map((datum: any) => {
                return (
                    <CardWrapper
                        key={`active_alerts_${datum.firedAt}`}
                        message={
                            <Stack direction="row" sx={{}}>
                                <AlertTypeContent alertType={datum.alertType} />
                                <IconButton>?</IconButton>
                            </Stack>
                        }
                    >
                        fired: {datum.firedAt}
                        <br />
                        resolved: {datum.resolvedAt}
                        <br />
                        interval : {datum.alertDetails.evaluation_interval}
                    </CardWrapper>
                );
            })}
        </Stack>
    );
}

export default ActiveAlerts;
