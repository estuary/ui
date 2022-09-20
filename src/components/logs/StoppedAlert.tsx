import { Alert, Button, Collapse } from '@mui/material';
import { LINK_BUTTON_STYLING } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { useLogsContext } from './Context';

function StoppedAlert() {
    const { networkFailure, stopped, reset } = useLogsContext();

    return (
        <Collapse in={stopped}>
            <Alert severity="warning">
                <FormattedMessage
                    id={
                        networkFailure
                            ? 'logs.networkFailure'
                            : 'logs.tooManyEmpty'
                    }
                    values={{
                        restartCTA: (
                            <Button
                                variant="text"
                                sx={LINK_BUTTON_STYLING}
                                onClick={reset}
                            >
                                <FormattedMessage id="logs.restartLink" />
                            </Button>
                        ),
                    }}
                />
            </Alert>
        </Collapse>
    );
}

export default StoppedAlert;
