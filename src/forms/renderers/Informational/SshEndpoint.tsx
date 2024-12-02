import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

function SshEndpointInfo() {
    const intl = useIntl();

    const ipList = useMemo(() => {
        // Check if private data plane has IPs and use 'em

        return intl.formatMessage({
            id: 'informational.sshEndpoint.ip',
        });
    }, [intl]);

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
