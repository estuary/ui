import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_isValidating,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import { DraftSpec } from 'hooks/useDraftSpecs';
import { get, has, isEqual, set } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stringifyJSON } from 'services/stringify';
import { Entity } from 'types';

function useDraftSpecEditor(
    entityName: string | undefined,
    localScope?: boolean,
    editorSchemaScope?: string
) {
    // Local State
    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);
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
            spec = has(draftSpec.spec, editorSchemaScope)
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
                const updateResponse = await modifyDraftSpec(updatedSpec, {
                    draft_id: draftId,
                    catalog_name: catalogName,
                    spec_type: specType,
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutate();
            }
        },
        [mutate, draftId, draftSpec]
    );

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

    useEffect(() => {
        if (currentCatalog && !isEqual(draftSpecRef.current, currentCatalog)) {
            setDraftSpec(currentCatalog);
            draftSpecRef.current = currentCatalog;
        }
    }, [currentCatalog]);

    // TODO (sync editing) : turning off as right now this will show lots of "Out of sync" errors
    //    because we are comparing two JSON objects that are being stringified and that means the order
    //    change change whenever. We should probably compare the two objects and THEN if those do not match
    //    show an error/diff editor.
    //
    // useEffectOnce(() => {
    //     const publicationSubscription = supabaseClient
    //         .from(TABLES.DRAFT_SPECS)
    //         .on('*', async (payload: any) => {
    //             if (payload.new.spec) {
    //                 setServerUpdates(payload.new.spec);
    //             }
    //         })
    //         .subscribe();

    //     setSubscription(publicationSubscription);

    //     return () => {
    //         if (subscription) {
    //             void supabaseClient.removeSubscription(subscription);
    //         }
    //     };
    // });

    // TODO (draftSpecEditor) need to better handle returning so we are not causing extra renders
    return useMemo(() => {
        return {
            onChange: processEditorValue,
            draftSpec,
            isValidating,
            mutate,
            defaultValue: specAsString,
        };
    }, [draftSpec, isValidating, mutate, processEditorValue, specAsString]);
}

export default useDraftSpecEditor;
