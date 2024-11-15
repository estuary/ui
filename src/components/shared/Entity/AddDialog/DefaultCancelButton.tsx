import { Button } from '@mui/material';
import { useIntl } from 'react-intl';
import { AddCollectionDialogCTAProps } from '../types';

function DefaultCancelButton({ toggle }: AddCollectionDialogCTAProps) {
    const intl = useIntl();
    return (
        <Button
            variant="outlined"
            onClick={() => {
                toggle(false);
            }}
        >
            {intl.formatMessage({ id: 'cta.cancel' })}
        </Button>
    );
}

export default DefaultCancelButton;
