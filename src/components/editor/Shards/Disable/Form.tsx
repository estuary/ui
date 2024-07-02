import { BooleanString } from 'components/editor/Bindings/Backfill';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { useEntityType } from 'context/EntityContext';

import { Check } from 'iconoir-react';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { snackbarSettings } from 'utils/notification-utils';
import useShards from './useShards';

function ShardsDisableForm() {
    const intl = useIntl();
    const entityType = useEntityType();

    const { enqueueSnackbar } = useSnackbar();
    const { shardDisabled, updateDisable } = useShards();

    const [localState, setLocalState] = useState(shardDisabled);

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    const value: BooleanString = useMemo(
        () => (!localState ? 'true' : 'false'),
        [localState]
    );

    const update = useCallback(
        (newVal: boolean) => {
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
        <OutlinedToggleButton
            value={value}
            selected={!localState}
            disabled={formActive}
            onClick={(_, checked: string) => {
                setFormState({ status: FormStatus.UPDATING, error: null });
                update(checked === 'true');
            }}
        >
            {!localState ? (
                <>
                    <FormattedMessage id="common.enabled" />

                    <Check style={{ marginLeft: 8, fontSize: 13 }} />
                </>
            ) : (
                <FormattedMessage id="common.disabled" />
            )}
        </OutlinedToggleButton>
    );
}

export default ShardsDisableForm;
