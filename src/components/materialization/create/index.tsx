import CloseIcon from '@mui/icons-material/Close';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

function NewMaterialization() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handlers = {
        close: () => {
            navigate('..'); //This is assuming this is a child of the /captures route.
        },
    };

    return (
        <Dialog
            open
            onClose={handlers.close}
            scroll="paper"
            fullScreen={fullScreen}
            fullWidth={!fullScreen}
            maxWidth="lg"
            sx={{
                '.MuiDialog-container': {
                    alignItems: 'flex-start',
                },
            }}
            aria-labelledby="new-materialization-dialog-title"
        >
            <DialogTitle id="new-materialization-dialog-title">
                <FormattedMessage id="materializationCreation.heading" />
                <IconButton
                    aria-label="close"
                    onClick={handlers.close}
                    sx={{
                        color: (buttonTheme) => buttonTheme.palette.grey[500],
                        position: 'absolute',
                        right: 0,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>Under Development</DialogContent>
        </Dialog>
    );
}

export default NewMaterialization;
