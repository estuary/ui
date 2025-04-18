import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

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
