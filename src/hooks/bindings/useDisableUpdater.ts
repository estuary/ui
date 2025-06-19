import type { BindingDisableUpdate } from 'src/stores/Binding/types';

import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import useDraftUpdater from 'src/hooks/useDraftUpdater';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';
import { getCollectionName } from 'src/utils/workflow-utils';

function useDisableUpdater(bindingUUID?: string) {
    const intl = useIntl();

    const entityType = useEntityType();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const { enqueueSnackbar } = useSnackbar();

    const [storeSetting, bindingIndex, collectionName] = useBindingStore(
        (state) => {
            if (!bindingUUID) {
                return [null, null, null];
            }

            const config = state.resourceConfigs[bindingUUID].meta;

            return [config.disable, config.bindingIndex, config.collectionName];
        }
    );

    const [generateToggleDisableUpdates, toggleDisable] = useBindingStore(
        (state) => [state.generateToggleDisableUpdates, state.toggleDisable]
    );
    const setFormState = useFormStateStore_setFormState();

    const draftUpdater = useDraftUpdater();

    const updateSetting = useCallback(
        async (bindingIndexes: BindingDisableUpdate[]) => {
            return draftUpdater(
                (spec) => {
                    let missingIndex = false;

                    bindingIndexes.forEach(({ bindingIndex, val }) => {
                        if (
                            missingIndex ||
                            // Make sure there is a binding there at least
                            !spec.bindings[bindingIndex] ||
                            // Try to be safe and make sure we have the right name
                            getCollectionName(spec.bindings[bindingIndex]) ===
                                collectionName
                        ) {
                            missingIndex = true;
                            return;
                        }

                        if (val === true) {
                            spec.bindings[bindingIndex].disable = val;
                        } else if (
                            Object.hasOwn(
                                spec.bindings[bindingIndex],
                                'disable'
                            )
                        ) {
                            delete spec.bindings[bindingIndex].disable;
                        }
                    });

                    if (missingIndex) {
                        return undefined;
                    }

                    return spec;
                },
                { spec_type: entityType }
            );
        },
        [collectionName, draftUpdater, entityType]
    );

    const setSaving = useSourceCaptureStore((state) => state.setSaving);

    const updateDraft = useCallback(
        async (
            targetUUIDs: string | string[] | null,
            value?: boolean,
            forceUpdate?: boolean
        ) => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            // Get a list of all the bindings that will need to be updated
            const toggleDisableUpdates = generateToggleDisableUpdates(
                targetUUIDs,
                value,
                forceUpdate
            );

            // Make the actual update
            return updateSetting(toggleDisableUpdates)
                .then(() => {
                    // Draft was updated so we can update the store now
                    toggleDisable(toggleDisableUpdates);

                    setFormState({ status: FormStatus.UPDATED });

                    return Promise.resolve(toggleDisableUpdates);
                })
                .catch((error) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'workflows.collectionSelector.notifications.toggle.disable.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setFormState({ status: FormStatus.FAILED });

                    return Promise.reject(error);
                })
                .finally(() => setSaving(false));
        },
        [
            enqueueSnackbar,
            generateToggleDisableUpdates,
            intl,
            toggleDisable,
            setFormState,
            setSaving,
            updateSetting,
        ]
    );

    let currentSetting: boolean | null | undefined = null;

    if (bindingIndex !== null) {
        if (
            draftSpecs?.[0]?.spec?.bindings &&
            draftSpecs?.[0]?.spec?.bindings.length > 0 &&
            draftSpecs[0].spec.bindings[bindingIndex]
        ) {
            currentSetting = draftSpecs[0].spec.bindings[bindingIndex].disable;
        } else {
            // Usually means the user has entered edit, adding some bindings, and has flipped
            //  the disable/enable toggle on the new bindings but did NOT click the next button
            //  yet.
            currentSetting = storeSetting;
        }
    } else {
        currentSetting = storeSetting;
    }

    return {
        currentSetting,
        updateDraft,
    };
}

export default useDisableUpdater;
