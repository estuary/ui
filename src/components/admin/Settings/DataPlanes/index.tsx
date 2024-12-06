import DataPlanesTable from 'components/tables/DataPlanes';
import { DataPlaneScopeContextProvider } from 'context/DataPlaneScopeContext';

function DataPlanes() {
    return (
        <DataPlaneScopeContextProvider>
            <DataPlanesTable />
        </DataPlaneScopeContextProvider>
    );
}

export default DataPlanes;
