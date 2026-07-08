import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import PrefixAlertTable from 'src/components/tables/PrefixAlerts';
import { AlertSubscriptionsProvider } from 'src/context/AlertSubscriptions';
import { AlertTypeProvider } from 'src/context/AlertType';

const docsUrl = 'https://docs.estuary.dev/reference/notifications/';

function PrefixAlerts() {
    return (
        <AlertTypeProvider>
            <AlertSubscriptionsProvider>
                <StandAloneTableTitle
                    docsUrl={docsUrl}
                    titleIntlKey="alerts.config.header"
                />
                <PrefixAlertTable />
            </AlertSubscriptionsProvider>
        </AlertTypeProvider>
    );
}

export default PrefixAlerts;
