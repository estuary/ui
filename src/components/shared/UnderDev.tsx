import { Box } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';

function UnderDev() {
    return (
        <Box sx={{ m: 2 }}>
            <AlertBox short severity="warning" title="Under Development">
                Please feel free to provide any and all feedback to the front
                end team.
            </AlertBox>
        </Box>
    );
}

export default UnderDev;
