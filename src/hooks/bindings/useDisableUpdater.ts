import type { BindingDisableUpdate } from 'src/stores/Binding/types';

import { useCallback, useMemo } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import useDraftUpdater from 'src/hooks/useDraftUpdater';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { snackbarSettings } from 'src/utils/notification-utils';
import { getCollectionName } from 'src/utils/workflow-utils';

function useDisableUpdater(bindingUUID?: string) {
    const intl = useIntl();

    const entityType = useEntityType();

    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const { enqueueSnackbar } = useSnackbar();

    const [storeSetting, bindingIndex, collectionName] = useBindingStore(
        (state) => {
            if (
                !bindingUUID ||
                !hasOwnProperty(state.resourceConfigs?.[bindingUUID], 'meta')
            ) {
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

                    // TODO (draft updater) - this is one of the few things that can directly
                    //  update a binding that isn't the current binding. We should look into
                    //  getting some of this validation shared with `ui/src/utils/workflow-utils.ts > getBindingIndex`
                    bindingIndexes.forEach(({ bindingIndex, val }) => {
                        if (
                            missingIndex ||
                            // Make sure there is a binding there at least
                            !spec.bindings[bindingIndex] ||
                            // Try to be safe and make sure we have the right name when we are updating
                            //  a specific binding
                            (collectionName &&
                                getCollectionName(
                                    spec.bindings[bindingIndex]
                                ) !== collectionName)
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

    const currentSetting: boolean | null | undefined = useMemo(() => {
        if (bindingIndex !== null) {
            // If there is a draft id then we are not going to run another generation
            //  so only use the setting from the draft
            if (draftId) {
                if (
                    draftSpecs?.[0]?.spec?.bindings &&
                    draftSpecs?.[0]?.spec?.bindings.length > 0 &&
                    draftSpecs[0].spec.bindings[bindingIndex]
                ) {
                    return draftSpecs[0].spec.bindings[bindingIndex].disable;
                }
            } else {
                // No draft ID means we will be using the store settings on the next call to
                //  generate the spec. This is common for create and _sometimes_ edit. Like when the user
                //  starts editing, adding some bindings, and has flipped the disable/enable toggle on the
                //  new bindings but did NOT click the next button yet.
                return storeSetting;
            }
        } else {
            return storeSetting;
        }

        return null;
    }, [bindingIndex, draftId, draftSpecs, storeSetting]);

    return {
        currentSetting,
        updateDraft,
    };
}

export default useDisableUpdater;
