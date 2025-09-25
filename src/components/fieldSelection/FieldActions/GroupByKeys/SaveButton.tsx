import type { BaseProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

const SaveButton = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const setSingleGroupBy = useBindingStore((state) => state.setSingleGroupBy);

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive || !hasLength(selections)}
            onClick={() => {
                if (!selections) {
                    // TODO: display error.

                    return;
                }

                setSingleGroupBy(bindingUUID, []);
            }}
            size="small"
            style={{ textWrap: 'nowrap' }}
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
};

export default SaveButton;
