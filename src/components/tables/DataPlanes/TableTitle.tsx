
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';

const docsUrl = 'https://docs.estuary.dev/reference/allow-ip-addresses/';

function TableTitle() {
    const { dataPlaneScope } = useDataPlaneScope();

    return (
        <StandAloneTableTitle
            titleIntlKey={
                DATA_PLANE_SETTINGS[dataPlaneScope].table.headerIntlKey
            }
            docsUrl={docsUrl}
        />
    );
}

export default TableTitle;
