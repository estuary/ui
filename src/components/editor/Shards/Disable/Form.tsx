import { useCallback, useState } from 'react';

import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';

import BooleanToggleButton from 'src/components/shared/buttons/BooleanToggleButton';
import { useEntityType } from 'src/context/EntityContext';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { snackbarSettings } from 'src/utils/notification-utils';
import useShards from 'src/components/editor/Shards/Disable/useShards';

function ShardsDisableForm() {
    const intl = useIntl();
    const entityType = useEntityType();

    const { enqueueSnackbar } = useSnackbar();
    const { shardDisabled, updateDisable } = useShards();
    const [localState, setLocalState] = useState(shardDisabled);

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    const update = useCallback(
        (newVal: boolean) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            setLocalState(newVal);
            updateDisable(newVal)
                .then(() => {})
                .catch(() => {
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
            {!localState ? (
                <FormattedMessage id="common.enabled" />
            ) : (
                <FormattedMessage id="common.disabled" />
            )}
        </BooleanToggleButton>
    );
}

export default ShardsDisableForm;
