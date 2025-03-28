import { Stack, Typography } from '@mui/material';
import FullPageWrapper from 'src/app/FullPageWrapper';
import MessageWithLink from 'src/components/content/MessageWithLink';
import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';
import { useIntl } from 'react-intl';

function SsoUserMessage() {
    const intl = useIntl();

    return (
        <FullPageWrapper fullWidth>
            <AlertBox
                short
                severity="info"
                title={intl.formatMessage({ id: 'tenant.usedSso.title' })}
            >
                <Stack spacing={2}>
                    <Typography>
                        {intl.formatMessage({ id: 'tenant.usedSso.message' })}
                    </Typography>

                    <Stack spacing={1}>
                        <MessageWithLink messageID="tenant.usedSso.instructions" />

                        <SingleLineCode
                            sx={{
                                maxWidth: 'fit-content',
                            }}
                            value={intl.formatMessage({
                                id: 'tenant.usedSso.instructions.fullPath',
                            })}
                        />
                    </Stack>
                </Stack>
            </AlertBox>
        </FullPageWrapper>
    );
}

export default SsoUserMessage;
