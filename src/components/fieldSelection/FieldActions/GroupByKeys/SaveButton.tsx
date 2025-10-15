import type { GroupByKeysSaveButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

// This component was modeled after the SaveButton component used within the AlgorithmMenu component.
const SaveButton = ({
    bindingUUID,
    close,
    loading,
    selections,
}: GroupByKeysSaveButtonProps) => {
    const intl = useIntl();

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const setExplicitGroupBy = useBindingStore(
        (state) => state.setExplicitGroupBy
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive}
            onClick={() => {
                if (!selections) {
                    // TODO: display error.

                    return;
                }

                setExplicitGroupBy(
                    bindingUUID,
                    selections.map(({ field }) => field)
                );
                advanceHydrationStatus('HYDRATED', bindingUUID);
                close();
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
