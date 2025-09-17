import type {
    AlertsVariables,
    ResolvedAlertsForTaskQuery,
} from 'src/types/gql';

import { Grid } from '@mui/material';

import { useIntl } from 'react-intl';
import { gql } from 'urql';

import CardWrapper from 'src/components/shared/CardWrapper';
import ActiveAlerts from 'src/components/shared/Entity/Details/Alerts/ActiveAlerts';
import NotificationSettings from 'src/components/shared/Entity/Details/Overview/NotificationSettings';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const resolvedAlertsForTaskQuery = gql<
    ResolvedAlertsForTaskQuery,
    AlertsVariables
>`
    query ResolvedAlertsForTaskQuery($prefix: String!) {
        alerts(prefix: $prefix, active: false) {
            edges {
                node {
                    alertType
                    alertDetails: arguments
                    firedAt
                    catalogName
                    resolvedAt
                }
            }
        }
    }
`;

function EntityAlerts() {
    const intl = useIntl();
    const entityType = useEntityType();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    return (
        <Grid container spacing={2}>
            <Grid
                item
                xs={12}
                md={!isCollection ? 6 : 12}
                lg={!isCollection ? 8 : 12}
                sx={{
                    display: 'flex',
                }}
            >
                <ActiveAlerts />
            </Grid>

            {!isCollection && catalogName ? (
                <Grid item xs={12} md={6} lg={4}>
                    <NotificationSettings taskName={catalogName} />
                </Grid>
            ) : null}

            <Grid item xs={12}>
                <CardWrapper
                    message={intl.formatMessage({
                        id: 'alerts.history.title.active',
                    })}
                >
                    <AlertHistoryTable
                        tablePrefix={TablePrefixes.alertHistoryForEntity}
                        querySettings={{
                            query: resolvedAlertsForTaskQuery,
                            variables: { prefix: catalogName },
                            pause: !catalogName,
                        }}
                    />
                </CardWrapper>
            </Grid>
        </Grid>
    );
}

export default EntityAlerts;
