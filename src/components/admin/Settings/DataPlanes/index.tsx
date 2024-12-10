import DataPlanesTable from 'components/tables/DataPlanes';
import TableTitle from 'components/tables/DataPlanes/TableTitle';
import { DataPlaneScopeContextProvider } from 'context/DataPlaneScopeContext';

function DataPlanes() {
    return (
        <DataPlaneScopeContextProvider>
            <TableTitle />
            <DataPlanesTable />
        </DataPlaneScopeContextProvider>
    );
}

export default DataPlanes;
