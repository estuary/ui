import { Button, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import ErrorDialog from './index';

const ARIA_NAME = 'chunkNotFetched';

function MustReloadErrorDialog() {
    const navigate = useNavigate();

    const reloadPage = () => {
        navigate(0);
    };

    return (
        <ErrorDialog
            body={
                <Stack spacing={2}>
                    <Typography>
                        <FormattedMessage id="errorBoundry.chunkNotFetched.error.message1" />
                    </Typography>
                    <Typography>
                        <FormattedMessage id="errorBoundry.chunkNotFetched.error.message2" />
                    </Typography>
                    <Typography>
                        <FormattedMessage id="errorBoundry.chunkNotFetched.error.instructions" />
                    </Typography>
                </Stack>
            }
            bodyTitle={
                <FormattedMessage id="errorBoundry.chunkNotFetched.error.title" />
            }
            cta={
                <Button onClick={reloadPage}>
                    <FormattedMessage id="cta.reload" />
                </Button>
            }
            dialogTitle={
                <FormattedMessage id="errorBoundry.chunkNotFetched.dialog.title" />
            }
            name={ARIA_NAME}
        />
    );
}

export default MustReloadErrorDialog;
