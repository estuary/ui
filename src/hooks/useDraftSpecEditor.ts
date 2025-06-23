import type { DraftSpec, DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { Entity } from 'src/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { debounce, get, has, isEqual, set } from 'lodash';
import { useUnmount } from 'react-use';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_isValidating,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setSpecs,
} from 'src/components/editor/Store/hooks';
import { stringifyJSON } from 'src/services/stringify';
import { DEFAULT_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

function useDraftSpecEditor(
    entityName: string | undefined,
    localScope?: boolean,
    editorSchemaScope?: string,
    monitorCurrentCatalog?: boolean
) {
    // Local State
    // We store off a ref and a state so we can constantly do compares against
    //  the ref and not cause re-renders. This makes sure we do not do extra updates
    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);
    const [currentCatalogSyncing, setCurrentCatalogSyncing] = useState(false);
    const draftSpecRef = useRef<DraftSpec>(null);

    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog({
        localScope,
    });

    const setSpecs = useEditorStore_setSpecs({
        localScope,
    });
    const draftId = useEditorStore_persistedDraftId();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs({ localScope });
    const isValidating = useEditorStore_queryResponse_isValidating({
        localScope,
    });
    const mutate = useEditorStore_queryResponse_mutate({ localScope });

    const specAsString = useMemo(() => {
        let spec = draftSpec?.spec ?? null;

        if (draftSpec?.spec && editorSchemaScope) {
            // If there is a schema scope make sure it exists first
            //  otherwise we will fall back to the schema prop
            // This is just being super safe
            spec = has<any>(draftSpec.spec, editorSchemaScope)
                ? get(draftSpec.spec, editorSchemaScope)
                : draftSpec.spec.schema;
        }

        return stringifyJSON(spec);
    }, [draftSpec, editorSchemaScope]);

    const processEditorValue = useCallback(
        async (
            newVal: any,
            catalogName: string,
            specType: Entity,
            propUpdating?: string
        ) => {
            if (!mutate || !draftSpec) {
                return Promise.reject();
            } else {
                // Try setting to the newVal and if we are updating a single
                //  props then go ahead and make sure that specific prop is set correctly
                let updatedSpec = newVal;
                if (propUpdating) {
                    updatedSpec = set(
                        { ...draftSpec.spec },
                        propUpdating,
                        newVal
                    );
                }

                // Update the local copy of the spec that is contained within the entire draft
                setDraftSpec({
                    ...draftSpec,
                    spec: updatedSpec,
                });

                // Update only the SPEC on the server
                const updateResponse = await modifyDraftSpec(
                    updatedSpec,
                    {
                        draft_id: draftId,
                        catalog_name: catalogName,
                        spec_type: specType,
                    },
                    undefined,
                    'Manually Edited'
                );

                if (updateResponse.error) {
                    return Promise.reject();
                }

                // Fire off mutate so other uses know to update
                return mutate().then((args) => {
                    // Make the update to the current AFTER the mutate so things
                    //  get a chance to update first. Otherwise they will see NO change
                    //  and just ignore the updates.
                    if (args?.data && args.data[0]) {
                        draftSpecRef.current = args.data[0].spec;
                    }
                });
            }
        },
        [draftId, draftSpec, mutate]
    );

    // This is mainly for the binding collection editing
    useEffect(() => {
        if (draftSpecs.length > 0) {
            setSpecs(draftSpecs);

            if (currentCatalog) {
                draftSpecs.some((val) => {
                    if (val.catalog_name !== entityName) {
                        return false;
                    }

                    if (!isEqual(draftSpecRef.current, val)) {
                        setDraftSpec(val);
                        draftSpecRef.current = val;
                        return true;
                    }

                    return false;
                });
            }
        }
    }, [currentCatalog, draftSpecs, entityName, setSpecs]);

    // This is for keeping advanced spec editor updated as the forms change.
    //  Especially stuff like backfill, autoDiscover, and timeTravel
    const debouncedUpdate = useRef(
        debounce((updatedCurrentCatalog: DraftSpecQuery) => {
            setDraftSpec(updatedCurrentCatalog);
            setCurrentCatalogSyncing(false);
        }, DEFAULT_DEBOUNCE_WAIT)
    );
    useUnmount(() => {
        debouncedUpdate.current?.cancel();
    });

    useEffect(() => {
        if (
            monitorCurrentCatalog &&
            currentCatalog &&
            !isEqual(draftSpecRef.current, currentCatalog)
        ) {
            setCurrentCatalogSyncing(true);
            debouncedUpdate.current(currentCatalog);
        }
    }, [currentCatalog, monitorCurrentCatalog]);

    // TODO (draftSpecEditor) need to better handle returning so we are not causing extra renders
    return useMemo(() => {
        return {
            currentCatalogSyncing,
            defaultValue: specAsString,
            draftSpec,
            isValidating,
            mutate,
            onChange: processEditorValue,
        };
    }, [
        currentCatalogSyncing,
        draftSpec,
        isValidating,
        mutate,
        processEditorValue,
        specAsString,
    ]);
}

export default useDraftSpecEditor;
