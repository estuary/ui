import { Button, Collapse } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { LINK_BUTTON_STYLING } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { useLogsContext } from './Context';

function StoppedAlert() {
    const { networkFailure, stopped, reset, fetchingCanSafelyStop } =
        useLogsContext();

    const showAlert = !fetchingCanSafelyStop && stopped;

    return (
        <Collapse in={showAlert}>
            <AlertBox severity="info" short>
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
            </AlertBox>
        </Collapse>
    );
}

export default StoppedAlert;
