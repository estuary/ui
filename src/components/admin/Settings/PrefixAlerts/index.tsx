import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import PrefixAlertTable from 'src/components/tables/PrefixAlerts';
import { AlertSubscriptionsProvider } from 'src/context/AlertSubscriptions';

function PrefixAlerts() {
    return (
        <AlertSubscriptionsProvider>
            <StandAloneTableTitle titleIntlKey="alerts.config.header" />
            <PrefixAlertTable />
        </AlertSubscriptionsProvider>
    );
}

export default PrefixAlerts;
