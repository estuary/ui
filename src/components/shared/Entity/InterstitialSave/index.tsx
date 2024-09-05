import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

import DialogTitleWithClose from 'components/shared/Dialog/TitleWithClose';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_setShowInterstitialSave,
    useFormStateStore_showInterstitialSave,
} from 'stores/FormState/hooks';
import { InterstitialSaveProps } from './types';

function InterstitialSave({ children, title }: InterstitialSaveProps) {
    const showInterstitialSave = useFormStateStore_showInterstitialSave();
    const setShowInterstitialSave = useFormStateStore_setShowInterstitialSave();

    return (
        <Dialog open={showInterstitialSave} fullWidth maxWidth="lg">
            <DialogTitleWithClose
                onClose={() => {
                    setShowInterstitialSave(false);
                }}
                id=""
            >
                {title}
            </DialogTitleWithClose>

            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                        setShowInterstitialSave(false);
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                        console.log('TBD');
                    }}
                >
                    <FormattedMessage id="cta.continue" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InterstitialSave;
