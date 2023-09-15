import useDraftUpdater from 'hooks/useDraftUpdater';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import {
    useSchemaEvolution_addNewBindings,
    useSchemaEvolution_autoDiscover,
    useSchemaEvolution_evolveIncompatibleCollections,
    useSchemaEvolution_setSettingsActive,
    useSchemaEvolution_setSettingsSaving,
    useSchemaEvolution_settingsActive,
} from 'stores/SchemaEvolution/hooks';
import { Schema } from 'types';

function useAutoDiscovery() {
    // Schema Evolution Store
    const autoDiscover = useSchemaEvolution_autoDiscover();
    const addNewBindings = useSchemaEvolution_addNewBindings();
    const evolveIncompatibleCollections =
        useSchemaEvolution_evolveIncompatibleCollections();

    const settingsActive = useSchemaEvolution_settingsActive();
    const setSettingsActive = useSchemaEvolution_setSettingsActive();
    const setSettingsSaving = useSchemaEvolution_setSettingsSaving();

    // TODO (schema evolution): Determine a comfortable debounce interval.
    const debouncedUpdate = useRef(
        debounce(() => {
            setSettingsActive(false);
            setSettingsSaving(true);
        }, 500)
    );

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

    return useDraftUpdater(
        useCallback(
            (spec: Schema) => {
                const response = { ...spec };
                response.autoDiscover = autoDiscover
                    ? {
                          addNewBindings,
                          evolveIncompatibleCollections,
                      }
                    : null;

                return response;
            },
            [addNewBindings, autoDiscover, evolveIncompatibleCollections]
        )
    );
}

export default useAutoDiscovery;
