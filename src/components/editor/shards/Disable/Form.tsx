import { BooleanString } from 'components/editor/Bindings/Backfill';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { useEntityType } from 'context/EntityContext';

import { Check } from 'iconoir-react';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { snackbarSettings } from 'utils/notification-utils';
import useShards from './useShards';

function ShardsDisableForm() {
    const intl = useIntl();
    const entityType = useEntityType();

    const { enqueueSnackbar } = useSnackbar();
    const { shardDisabled, updateDisable } = useShards();

    const [updating, setUpdating] = useState(false);
    const [localState, setLocalState] = useState(shardDisabled);

    const formActive = useFormStateStore_isActive();

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
                    setUpdating(false);
                });
        },
        [enqueueSnackbar, entityType, intl, updateDisable]
    );

    return (
        <OutlinedToggleButton
            value={value}
            selected={!localState}
            disabled={formActive || updating}
            onClick={(_, checked: string) => {
                setUpdating(true);
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
