import type { ButtonProps } from '@mui/material';

import { Button, DialogActions } from '@mui/material';

import { FormattedMessage } from 'react-intl';

interface Props {
    onClose: ButtonProps['onClick'];
    onSave: ButtonProps['onClick'];
}

function StorageMappingActions({ onClose, onSave }: Props) {
    return (
        <DialogActions sx={{ p: 4, pt: 2 }}>
            <Button variant="outlined" size="small" onClick={onClose}>
                <FormattedMessage id="cta.cancel" />
            </Button>

            <Button variant="contained" size="small" onClick={onSave}>
                Next
            </Button>
        </DialogActions>
    );
}

export default StorageMappingActions;
