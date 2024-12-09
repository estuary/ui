import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import useCidrBlocks from 'hooks/useCidrBlocks';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';

function SshEndpointInfo() {
    const intl = useIntl();

    const cidrBlocks = useCidrBlocks();

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
                <Box
                    sx={{
                        maxWidth: 'fit-content',
                        minWidth: 'fit-content',
                    }}
                >
                    <SingleLineCode value={cidrBlocks(dataPlaneCidrBlocks)} />
                </Box>
            </AlertBox>
        </Box>
    );
}

export default SshEndpointInfo;
