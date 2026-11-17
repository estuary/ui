import type { GroupByKeysSaveButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useSnackbar } from 'notistack';

import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { snackbarSettings } from 'src/utils/notification-utils';

// This component was modeled after the SaveButton component used within the AlgorithmMenu component.
const SaveButton = ({
    bindingUUID,
    close,
    loading,
    selections,
}: GroupByKeysSaveButtonProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const currentCollection = useBinding_currentCollection();
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
                    const errorSource = currentCollection ?? 'a binding';

                    enqueueSnackbar(
                        `Group-by key update failed for ${errorSource}.`,
                        { ...snackbarSettings, variant: 'error' }
                    );

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
            Apply
        </Button>
    );
};

export default SaveButton;
