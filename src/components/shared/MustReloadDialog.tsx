import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import AlertBox from './AlertBox';

const ARIA_DESC_ID = 'chunkNotFetched-dialog-description';
const ARIA_LABEL_ID = 'chunkNotFetched-dialog-title';

function MustReloadDialog() {
    const navigate = useNavigate();

    const reloadPage = () => {
        navigate(0);
    };

    return (
        <Dialog
            open
            aria-labelledby={ARIA_LABEL_ID}
            aria-describedby={ARIA_DESC_ID}
        >
            <DialogTitle id={ARIA_LABEL_ID}>
                <FormattedMessage id="errorBoundry.chunkNotFetched.dialog.title" />
            </DialogTitle>
            <DialogContent>
                <AlertBox
                    short
                    severity="error"
                    title={
                        <FormattedMessage id="errorBoundry.chunkNotFetched.error.title" />
                    }
                >
                    <DialogContentText id={ARIA_DESC_ID} component="div">
                        <Typography>
                            <FormattedMessage id="errorBoundry.chunkNotFetched.error.message1" />
                        </Typography>
                        <Typography>
                            <FormattedMessage id="errorBoundry.chunkNotFetched.error.message2" />
                        </Typography>
                        <Typography>
                            <FormattedMessage id="errorBoundry.chunkNotFetched.error.instructions" />
                        </Typography>
                    </DialogContentText>
                </AlertBox>
            </DialogContent>
            <DialogActions>
                <Button onClick={reloadPage}>
                    <FormattedMessage id="cta.reload" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default MustReloadDialog;
