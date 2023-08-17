import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import {
    useSchemaEvolution_addNewBindings,
    useSchemaEvolution_evolveIncompatibleCollections,
    useSchemaEvolution_setSettingsActive,
    useSchemaEvolution_setSettingsSaving,
    useSchemaEvolution_settingsActive,
} from 'stores/SchemaEvolution/hooks';
import { Schema } from 'types';

function useAutoDiscovery() {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    // Schema Evolution Store
    const addNewBindings = useSchemaEvolution_addNewBindings();
    const evolveIncompatibleCollections =
        useSchemaEvolution_evolveIncompatibleCollections();

    const settingsActive = useSchemaEvolution_settingsActive();
    const setSettingsActive = useSchemaEvolution_setSettingsActive();
    const setSettingsSaving = useSchemaEvolution_setSettingsSaving();

    // TODO (schema evolution): Determine a comfortable debounce interval. A second or less feels too quick
    //   but five seconds feels too long.
    const debouncedUpdate = useRef(
        debounce(() => {
            setSettingsActive(false);
            setSettingsSaving(true);
        }, 3000)
    );

    useEffect(() => {
        if (settingsActive) {
            debouncedUpdate.current();
        }
    }, [addNewBindings, evolveIncompatibleCollections, settingsActive]);

    return useCallback(async () => {
        if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
            return Promise.reject();
        } else {
            const spec: Schema = draftSpecs[0].spec;

            spec.autoDiscover = {
                addNewBindings,
                evolveIncompatibleCollections,
            };

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpecs[0].catalog_name,
                spec_type: 'capture',
            });

            if (updateResponse.error) {
                return Promise.reject();
            }

            return mutateDraftSpecs();
        }
    }, [
        mutateDraftSpecs,
        addNewBindings,
        draftId,
        draftSpecs,
        evolveIncompatibleCollections,
    ]);
}

export default useAutoDiscovery;
