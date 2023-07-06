import { modifyDraftSpec } from 'api/draftSpecs';
import { AllowedScopes } from 'components/editor/MonacoEditor/types';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_isValidating,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import { DraftSpec } from 'hooks/useDraftSpecs';
import { get, has, set } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { stringifyJSON } from 'services/stringify';
import { Entity } from 'types';

function useDraftSpecEditor(
    entityName: string | undefined,
    localScope?: boolean,
    editorSchemaScope?: AllowedScopes | string
) {
    // Local State
    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

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
            propUpdating?: AllowedScopes | string
        ) => {
            if (mutate && draftSpec) {
                if (propUpdating) {
                    set(draftSpec.spec, propUpdating, newVal);
                } else {
                    draftSpec.spec = newVal;
                }

                const updateResponse = await modifyDraftSpec(draftSpec.spec, {
                    draft_id: draftId,
                    catalog_name: catalogName,
                    spec_type: specType,
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutate();
            } else {
                return Promise.reject();
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

                    setDraftSpec(val);
                    return true;
                });
            }
        }
        // We do not care if currentCatalog changes that is handled below
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftSpecs, entityName, setSpecs]);

    useEffect(() => {
        if (currentCatalog) {
            setDraftSpec(currentCatalog);
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

    return {
        onChange: processEditorValue,
        draftSpec,
        isValidating,
        mutate,
        defaultValue: specAsString,
    };
}

export default useDraftSpecEditor;
