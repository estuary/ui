import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

import DialogTitleWithClose from 'components/shared/Dialog/TitleWithClose';
import { FormattedMessage, useIntl } from 'react-intl';
import BindingReview from './BindingReview';
import { DataflowResetModalProps } from './types';

function DataflowResetModal({ open, setOpen }: DataflowResetModalProps) {
    const intl = useIntl();

    return (
        <Dialog open={open} fullWidth maxWidth="lg">
            <DialogTitleWithClose
                onClose={() => {
                    setOpen(false);
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
                        setOpen(false);
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
