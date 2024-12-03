import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';

function SshEndpointInfo() {
    const intl = useIntl();

    const cidrBlocks = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.cidrBlocks
    );

    const ipList = useMemo(() => {
        // Check if private data plane has IPs and use 'em
        if (cidrBlocks && cidrBlocks.length > 0) {
            return cidrBlocks.join(', ');
        }

        return intl.formatMessage({
            id: 'informational.sshEndpoint.ip',
        });
    }, [intl, cidrBlocks]);

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
                    <SingleLineCode value={ipList} />
                </Box>
            </AlertBox>
        </Box>
    );
}

export default SshEndpointInfo;
