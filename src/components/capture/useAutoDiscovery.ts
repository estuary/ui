import type { Schema } from 'src/types';

import { useCallback, useEffect, useRef } from 'react';

import { cloneDeep, debounce } from 'lodash';
import { useUnmount } from 'react-use';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import {
    useSchemaEvolution_addNewBindings,
    useSchemaEvolution_autoDiscover,
    useSchemaEvolution_evolveIncompatibleCollections,
    useSchemaEvolution_setSettingsActive,
    useSchemaEvolution_setSettingsSaving,
    useSchemaEvolution_settingsActive,
} from 'src/stores/SchemaEvolution/hooks';
import { DEFAULT_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

function useAutoDiscovery() {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    // Schema Evolution Store
    const autoDiscover = useSchemaEvolution_autoDiscover();
    const addNewBindings = useSchemaEvolution_addNewBindings();
    const evolveIncompatibleCollections =
        useSchemaEvolution_evolveIncompatibleCollections();

    const settingsActive = useSchemaEvolution_settingsActive();
    const setSettingsActive = useSchemaEvolution_setSettingsActive();
    const setSettingsSaving = useSchemaEvolution_setSettingsSaving();

    const debouncedUpdate = useRef(
        debounce(() => {
            setSettingsActive(false);
            setSettingsSaving(true);
        }, DEFAULT_DEBOUNCE_WAIT)
    );
    useUnmount(() => {
        debouncedUpdate.current?.cancel();
    });

    useEffect(() => {
        if (settingsActive) {
            debouncedUpdate.current();
        }
    }, [
        addNewBindings,
        autoDiscover,
        evolveIncompatibleCollections,
        settingsActive,
    ]);

    return useCallback(async () => {
        if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
            return Promise.reject();
        } else {
            const spec: Schema = cloneDeep(draftSpecs[0].spec);

            spec.autoDiscover = autoDiscover
                ? {
                      addNewBindings,
                      evolveIncompatibleCollections,
                  }
                : null;

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpecs[0].catalog_name,
                spec_type: 'capture',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        }
    }, [
        mutateDraftSpecs,
        addNewBindings,
        autoDiscover,
        draftId,
        draftSpecs,
        evolveIncompatibleCollections,
    ]);
}

export default useAutoDiscovery;
