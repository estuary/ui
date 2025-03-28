import { Box } from '@mui/material';
import AlertBox from 'src/components/shared/AlertBox';
import CopyCidrBlocks from 'src/components/shared/CopyCidrBlocks';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

function SshEndpointInfo() {
    const intl = useIntl();

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
                title={intl.formatMessage({
                    id: 'informational.sshEndpoint.title',
                })}
            >
                <CopyCidrBlocks cidrBlocks={dataPlaneCidrBlocks} />
            </AlertBox>
        </Box>
    );
}

export default SshEndpointInfo;
