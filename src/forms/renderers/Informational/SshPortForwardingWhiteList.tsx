import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';

function SshPortForwardingWhiteList() {
    const intl = useIntl();

    return (
        <Box
            sx={{
                maxWidth: 'fit-content',
                minWidth: 'fit-content',
            }}
        >
            <AlertBox
                severity="info"
                title={intl.formatMessage({ id: 'sshWhiteList.title' })}
                short
            >
                <SingleLineCode
                    value={intl.formatMessage({ id: 'sshWhiteList.ipAddress' })}
                />
            </AlertBox>
        </Box>
    );
}

export default SshPortForwardingWhiteList;
