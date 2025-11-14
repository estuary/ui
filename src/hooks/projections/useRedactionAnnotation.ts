import type { Schema } from 'src/types';
import type { RedactionStrategy } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { cloneDeep, omit } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { hasWriteSchema } from 'src/utils/schema-utils';

export const useRedactionAnnotation = () => {
    const currentCollection = useBinding_currentCollection();

    const collectionSpec = useBindingsEditorStore(
        (state) => state.collectionData?.spec
    );
    const existingSchemaProperties = useBindingsEditorStore(
        (state) => state.schemaProperties
    );

    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateRedactionAnnotation = useCallback(
        async (field: string, strategy: RedactionStrategy | null) => {
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

            const existingFieldAnnotations =
                existingSchemaProperties?.[field] ?? {};

            const existingFieldAnnotationKeys = Object.keys(
                existingFieldAnnotations
            );

            if (strategy) {
                spec[schemaProp].properties = {
                    ...existingSchemaProperties,
                    [field]: {
                        ...existingFieldAnnotations,
                        redact: { strategy },
                    },
                };
            } else if (
                existingFieldAnnotationKeys.length === 1 &&
                existingFieldAnnotationKeys.includes('redact')
            ) {
                // Remove the annotation stanza for this field when the redaction strategy is unset
                // and only the redact annotation was previously defined.
                spec[schemaProp].properties = omit(
                    spec[schemaProp].properties,
                    field
                );
            } else if (
                existingFieldAnnotationKeys.length > 1 &&
                existingFieldAnnotationKeys.includes('redact')
            ) {
                // Remove the redact annotation for this field when the redaction strategy is unset
                // and additional annotations exist for this field.
                spec[schemaProp].properties[field] = omit(
                    spec[schemaProp].properties[field],
                    'redact'
                );
            } else {
                return Promise.resolve('noop');
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: currentCollection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [
            collectionSpec,
            currentCollection,
            draftId,
            existingSchemaProperties,
            mutateDraftSpecs,
        ]
    );

    return { updateRedactionAnnotation };
};
