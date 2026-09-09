import DataPlanesTable from 'src/components/tables/DataPlanes';
import { StandAloneTableTitle } from 'src/components/tables/EntityTable/StandAloneTableTitle';

const docsUrl = 'https://docs.estuary.dev/reference/allow-ip-addresses/';

export function DataPlanes() {
    return (
        <>
            <StandAloneTableTitle title="Data Planes" docsUrl={docsUrl} />
            <DataPlanesTable />
        </>
    );
}
