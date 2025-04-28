import { useCallback, useEffect, useState } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import useShards from 'src/components/editor/Shards/Disable/useShards';
import BooleanToggleButton from 'src/components/shared/buttons/BooleanToggleButton';
import { useEntityType } from 'src/context/EntityContext';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { snackbarSettings } from 'src/utils/notification-utils';

function ShardsDisableForm() {
    const intl = useIntl();
    const entityType = useEntityType();

    const { enqueueSnackbar } = useSnackbar();
    const { shardDisabled, updateDisable } = useShards();
    const [localState, setLocalState] = useState(shardDisabled);

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Mainly here for initial loading of page since it takes a little bit
    //  of time to populate `shardDisabled`
    useEffect(() => {
        setLocalState((prevVal) => {
            if (prevVal === shardDisabled) {
                return prevVal;
            }

            return shardDisabled;
        });
    }, [shardDisabled]);

    const update = useCallback(
        (newVal: boolean) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            // Set local state right away so the button feels fast
            setLocalState(newVal);

            // Update the actual spec
            updateDisable(newVal)
                .then(() => {})
                .catch(() => {
                    // If there was any kind of error put the opposite back in
                    setLocalState(!newVal);

                    enqueueSnackbar(
                        intl.formatMessage(
                            {
                                id: 'workflows.disable.update.error',
                            },
                            {
                                entityType,
                            }
                        ),
                        { ...snackbarSettings, variant: 'error' }
                    );
                })
                .finally(() => {
                    // We are not used the `Failed` status here because we just show a message and flip the local
                    //  state back. Since this is non-blocking I think it is safe for right now.
                    setFormState({ status: FormStatus.UPDATED });
                });
        },
        [enqueueSnackbar, entityType, intl, setFormState, updateDisable]
    );

    return (
        <BooleanToggleButton
            disabled={formActive}
            selected={!localState}
            onClick={(_, checked: string) => {
                update(checked === 'true');
            }}
        >
            {intl.formatMessage({
                id: !localState ? 'common.enabled' : 'common.disabled',
            })}
        </BooleanToggleButton>
    );
}

export default ShardsDisableForm;
