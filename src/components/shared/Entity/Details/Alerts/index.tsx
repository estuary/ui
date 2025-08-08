import { Box } from '@mui/material';

import EntityAlerts from 'src/components/shared/Entity/Alerts';
import UnderDev from 'src/components/shared/UnderDev';

function Alerts() {
    return (
        <Box>
            <UnderDev />
            <EntityAlerts />
        </Box>
    );
}

export default Alerts;
