import type { BaseButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

const ExcludeAllButton = ({
    bindingUUID,
    loading,
    selections,
}: BaseButtonProps) => {
    const intl = useIntl();

    const setMultiSelection = useBindingStore(
        (state) => state.setMultiSelection
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive || !hasLength(selections)}
            onClick={() => {
                if (!selections) {
                    // TODO: display error.

                    return;
                }

                setMultiSelection(
                    bindingUUID,
                    selections.map(({ field }) => field),
                    'exclude'
                );
            }}
            style={{ textWrap: 'nowrap' }}
            variant="outlined"
        >
            {intl.formatMessage({ id: 'fieldSelection.table.cta.excludeAll' })}
        </Button>
    );
};

export default ExcludeAllButton;
