import DataPlanesTable from 'src/components/tables/DataPlanes';
import TableTitle from 'src/components/tables/DataPlanes/TableTitle';
import { DataPlaneScopeContextProvider } from 'src/context/DataPlaneScopeContext';

function DataPlanes() {
    return (
        <DataPlaneScopeContextProvider>
            <TableTitle />
            <DataPlanesTable />
        </DataPlaneScopeContextProvider>
    );
}

export default DataPlanes;
