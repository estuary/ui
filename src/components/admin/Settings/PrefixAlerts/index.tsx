import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import PrefixAlertTable from 'src/components/tables/PrefixAlerts';

function PrefixAlerts() {
    return (
        <>
            <StandAloneTableTitle titleIntlKey="admin.alerts.header" />
            <PrefixAlertTable />
        </>
    );
}

export default PrefixAlerts;
