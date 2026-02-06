import { Box, Grid } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import NotificationSettings from 'src/components/shared/Entity/Details/Overview/NotificationSettings';
import AlertHistoryTable from 'src/components/tables/AlertHistory';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { TablePrefixes } from 'src/stores/Tables/hooks';

function EntityAlerts() {
    const intl = useIntl();
    const entityType = useEntityType();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    return (
        <Box sx={{ mt: 5 }}>
            <Grid
                container
                spacing={2}
                rowSpacing={5}
                sx={{ flexDirection: 'row-reverse' }}
            >
                {!isCollection && catalogName ? (
                    <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                        <NotificationSettings taskName={catalogName} />
                    </Grid>
                ) : null}

                <Grid size={{ xs: 12, md: 12, lg: !isCollection ? 8 : 12 }}>
                    <CardWrapper
                        message={intl.formatMessage({
                            id: 'alerts.history.title.active',
                        })}
                    >
                        <AlertHistoryTable
                            active
                            disableFooter
                            tablePrefix={TablePrefixes.alertsForEntity}
                        />
                    </CardWrapper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <CardWrapper
                        message={intl.formatMessage({
                            id: 'alerts.history.title.resolved',
                        })}
                    >
                        <AlertHistoryTable
                            active={false}
                            tablePrefix={TablePrefixes.alertHistoryForEntity}
                        />
                    </CardWrapper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default EntityAlerts;
