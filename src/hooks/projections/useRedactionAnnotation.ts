import type { Schema } from 'src/types';
import type {
    CollectionSchemaProperties,
    RedactionStrategy_Schema,
} from 'src/types/schemaModels';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { getSchemaProperties, hasWriteSchema } from 'src/utils/schema-utils';

export const useRedactionAnnotation = () => {
    const currentCollection = useBinding_currentCollection();

    const collectionSpec = useBindingsEditorStore(
        (state) => state.collectionData?.spec
    );

    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateRedactionAnnotation = useCallback(
        async (
            existingSchemaProperties: CollectionSchemaProperties | null,
            pointer: string,
            strategy: RedactionStrategy_Schema | null
        ) => {
            const schemaProp = hasWriteSchema(collectionSpec)
                ? 'writeSchema'
                : hasOwnProperty(collectionSpec, 'schema')
                  ? 'schema'
                  : undefined;

            if (
                !mutateDraftSpecs ||
                !currentCollection ||
                !collectionSpec ||
                !schemaProp
            ) {
                return Promise.reject();
            }

            const spec: Schema = cloneDeep(collectionSpec);

            const existingFieldAnnotations = getSchemaProperties(
                existingSchemaProperties,
                pointer
            );

            if (strategy) {
                spec[schemaProp].properties = {
                    ...existingSchemaProperties,
                    ['temp_key']: {
                        ...existingFieldAnnotations,
                        redact: { strategy },
                    },
                };
            } else {
                return Promise.resolve(undefined);
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: currentCollection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve(updateResponse);
        },
        [collectionSpec, currentCollection, draftId, mutateDraftSpecs]
    );

    return { updateRedactionAnnotation };
};
