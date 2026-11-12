import { withBranch } from 'react-semantic-tree';

import DataPlanesTable from 'src/components/tables/DataPlanes';
import { StandAloneTableTitle } from 'src/components/tables/EntityTable/StandAloneTableTitle';

const docsUrl = 'https://docs.estuary.dev/reference/allow-ip-addresses/';

function _DataPlanes() {
    return (
        <>
            <StandAloneTableTitle title="Data Planes" docsUrl={docsUrl} />
            <DataPlanesTable />
        </>
    );
}

export const DataPlanes = withBranch('Data Planes')(_DataPlanes);
