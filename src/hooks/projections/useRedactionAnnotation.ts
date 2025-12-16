import type { Schema } from 'src/types';
import type { RedactionStrategy_Schema } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import {
    getWriteSchemaProperty,
    setSchemaProperties,
} from 'src/utils/schema-utils';

export const useRedactionAnnotation = () => {
    const currentCollection = useBinding_currentCollection();

    const collectionSpec = useBindingsEditorStore(
        (state) => state.collectionData?.spec
    );

    const draftId = useEditorStore_persistedDraftId();

    const updateRedactionAnnotation = useCallback(
        async (pointer: string, strategy: RedactionStrategy_Schema | null) => {
            const schemaProp = getWriteSchemaProperty(collectionSpec);

            if (!currentCollection || !collectionSpec || !schemaProp) {
                logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                    errored: true,
                    operation: 'redact',
                    pointer,
                    reason: 'collection-data-missing',
                    strategy,
                });

                return Promise.reject();
            }

            const spec: Schema = cloneDeep(collectionSpec);

            try {
                setSchemaProperties(spec[schemaProp], pointer, {
                    id: 'redact',
                    value: strategy ? { strategy } : undefined,
                });
            } catch {
                logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                    errored: true,
                    operation: 'redact',
                    pointer,
                    reason: 'annotation-definition-failed',
                    strategy,
                });

                return Promise.reject();
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: currentCollection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                    errored: true,
                    operation: 'redact',
                    pointer,
                    reason: 'server-update-failed',
                    strategy,
                });

                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve(updateResponse);
        },
        [collectionSpec, currentCollection, draftId]
    );

    return { updateRedactionAnnotation };
};
