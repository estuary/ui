import StandAloneTableTitle from 'components/tables/EntityTable/StandAloneTableTitle';
import PrefixAlertTable from 'components/tables/PrefixAlerts';

function PrefixAlerts() {
    return (
        <>
            <StandAloneTableTitle titleIntlKey="admin.alerts.header" />
            <PrefixAlertTable />
        </>
    );
}

export default PrefixAlerts;
