import { Box } from '@mui/material';
import DataPlanesTable from 'components/tables/DataPlanes';
import { DataPlaneScopeContextProvider } from 'context/DataPlaneScopeContext';

function DataPlanes() {
    return (
        <Box>
            <DataPlaneScopeContextProvider>
                <DataPlanesTable />
            </DataPlaneScopeContextProvider>
        </Box>
    );
}

export default DataPlanes;
