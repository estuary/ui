import { Stack, Typography } from '@mui/material';
import FullPageWrapper from 'app/FullPageWrapper';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';

function SsoUserMessage() {
    const intl = useIntl();

    return (
        <FullPageWrapper fullWidth={true}>
            <AlertBox
                short
                severity="info"
                title={intl.formatMessage({ id: 'tenant.usedSso.title' })}
            >
                <Stack spacing={1}>
                    <Typography>
                        {intl.formatMessage({ id: 'tenant.usedSso.message' })}
                    </Typography>

                    <Stack>
                        <Typography>
                            {intl.formatMessage({
                                id: 'tenant.usedSso.instructions1',
                            })}
                        </Typography>

                        <Typography>
                            {intl.formatMessage({
                                id: 'tenant.usedSso.instructions2',
                            })}
                        </Typography>
                    </Stack>
                </Stack>
            </AlertBox>
        </FullPageWrapper>
    );
}

export default SsoUserMessage;
