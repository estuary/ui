import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

import DialogTitleWithClose from 'components/shared/Dialog/TitleWithClose';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useFormStateStore_setShowInterstitialSave,
    useFormStateStore_showInterstitialSave,
} from 'stores/FormState/hooks';
import BindingReview from './BindingReview';

function DataflowResetModal() {
    const intl = useIntl();

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
                {intl.formatMessage({
                    id: 'workflows.save.review.header',
                })}
            </DialogTitleWithClose>

            <DialogContent>
                <BindingReview />
            </DialogContent>
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

export default DataflowResetModal;
