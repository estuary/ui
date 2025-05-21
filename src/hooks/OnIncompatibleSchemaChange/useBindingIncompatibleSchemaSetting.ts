import type { AutoCompleteOptionForIncompatibleSchemaChange } from 'src/components/incompatibleSchemaChange/types';
import type { BindingMetadata, Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';
import { useIntl } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import { addOrRemoveOnIncompatibleSchemaChange } from 'src/utils/entity-utils';
import { hasLength } from 'src/utils/misc-utils';

function useBindingIncompatibleSchemaSetting() {
    const intl = useIntl();
    const entityType = useEntityType();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateOnIncompatibleSchemaChange = useCallback(
        async (
            value:
                | AutoCompleteOptionForIncompatibleSchemaChange['val']
                | undefined,
            bindingMetadata: BindingMetadata[]
        ) => {
            if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
                logRocketEvent(
                    `${CustomEvents.INCOMPATIBLE_SCHEMA_CHANGE}:Missing Draft Resources`,
                    {
                        draftIdMissing: !draftId,
                        draftSpecMissing: draftSpecs.length === 0,
                        mutateMissing: !mutateDraftSpecs,
                    }
                );

                return Promise.resolve();
            }

            if (!hasLength(bindingMetadata)) {
                return Promise.resolve();
            }

            const invalidBindingIndex = bindingMetadata.findIndex(
                ({ bindingIndex }) => bindingIndex === -1
            );

            if (invalidBindingIndex > -1) {
                return Promise.reject({
                    ...BASE_ERROR,
                    message: intl.formatMessage(
                        {
                            id: 'incompatibleSchemaChange.error.bindingSettingUpdateFailed',
                        },
                        {
                            collection:
                                bindingMetadata[invalidBindingIndex].collection,
                        }
                    ),
                });
            }

            const spec: Schema = cloneDeep(draftSpecs[0].spec);

            bindingMetadata.forEach(({ bindingIndex }) => {
                if (bindingIndex > -1) {
                    addOrRemoveOnIncompatibleSchemaChange(
                        spec.bindings[bindingIndex],
                        value
                    );
                }
            });

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpecs[0].catalog_name,
                spec_type: entityType,
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpecs, entityType, intl, mutateDraftSpecs]
    );

    return { updateOnIncompatibleSchemaChange };
}

export default useBindingIncompatibleSchemaSetting;
