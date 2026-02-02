import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import {
    getWriteSchemaProperty,
    setSchemaProperties,
} from 'src/utils/schema-utils';

export const useDefaultField = () => {
    const currentCollection = useBinding_currentCollection();

    const collectionSpec = useBindingsEditorStore(
        (state) => state.collectionData?.spec
    );

    const draftId = useEditorStore_persistedDraftId();

    const updateDefaultField = useCallback(
        async (pointer: string, defaultValue: any | null) => {
            const schemaProp = getWriteSchemaProperty(collectionSpec);

            if (!currentCollection || !collectionSpec || !schemaProp) {
                logRocketEvent('Schema_Edit', {
                    errored: true,
                    operation: 'default',
                    reason: 'collection-data-missing',
                    defaultValue,
                    pointer,
                });

                return Promise.reject();
            }

            const spec: Schema = cloneDeep(collectionSpec);

            try {
                setSchemaProperties(spec[schemaProp], pointer, {
                    id: 'default',
                    value: defaultValue,
                });
            } catch {
                logRocketEvent('Schema_Edit', {
                    errored: true,
                    operation: 'default',
                    reason: 'annotation-definition-failed',
                    pointer,
                    defaultValue,
                });

                return Promise.reject();
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: currentCollection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                logRocketEvent('Schema_Edit', {
                    errored: true,
                    operation: 'default',
                    reason: 'server-update-failed',
                    pointer,
                    defaultValue,
                });

                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve(updateResponse);
        },
        [collectionSpec, currentCollection, draftId]
    );

    return { updateDefaultField };
};
