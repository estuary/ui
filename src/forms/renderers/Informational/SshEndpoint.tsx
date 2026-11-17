import { Box } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import CopyCidrBlocks from 'src/components/shared/CopyCidrBlocks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

function SshEndpointInfo() {
    const dataPlaneCidrBlocks = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.cidrBlocks
    );

    return (
        <Box
            sx={{
                mb: 2,
            }}
        >
            <AlertBox
                severity="info"
                short
                title="All Estuary traffic comes from a group of IPs that can be whitelisted:"
            >
                <CopyCidrBlocks cidrBlocks={dataPlaneCidrBlocks} />
            </AlertBox>
        </Box>
    );
}

export default SshEndpointInfo;
