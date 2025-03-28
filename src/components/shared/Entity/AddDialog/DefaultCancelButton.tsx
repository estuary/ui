import { Button } from '@mui/material';

import { useIntl } from 'react-intl';
import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

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
