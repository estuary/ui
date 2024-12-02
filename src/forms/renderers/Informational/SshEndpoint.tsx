import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { formatSshSubnets } from 'utils/dataPlane-utils';

function SshEndpointInfo() {
    const intl = useIntl();

    const sshSubnets = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.sshSubnets
    );

    const ipList = useMemo(() => {
        // Check if private data plane has IPs and use 'em
        if (sshSubnets && sshSubnets.length > 0) {
            return sshSubnets.map(formatSshSubnets).join(', ');
        }

        return intl.formatMessage({
            id: 'informational.sshEndpoint.ip',
        });
    }, [intl, sshSubnets]);

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
