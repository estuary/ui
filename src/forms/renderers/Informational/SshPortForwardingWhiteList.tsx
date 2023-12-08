import { Box } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';

function SshPortForwardingWhiteList() {
    const intl = useIntl();

    return (
        <Box>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({ id: 'sshWhiteList.title' })}
            >
                <Box
                    sx={{
                        maxWidth: 'fit-content',
                        minWidth: 'fit-content',
                    }}
                >
                    <SingleLineCode
                        value={intl.formatMessage({
                            id: 'sshWhiteList.ipAddress',
                        })}
                    />
                </Box>
            </AlertBox>
        </Box>
    );
}

export default SshPortForwardingWhiteList;
