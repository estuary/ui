import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { AutoCompleteOption } from 'components/incompatibleSchemaChange/types';
import { useEntityType } from 'context/EntityContext';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { BindingMetadata, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

const updateSchema = (binding: any, newVal: any) => {
    if (newVal) {
        binding.onIncompatibleSchemaChange = newVal;
    } else {
        delete binding.onIncompatibleSchemaChange;
    }
};

function useBindingIncompatibleSchemaSetting() {
    const intl = useIntl();
    const entityType = useEntityType();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateOnIncompatibleSchemaChange = useCallback(
        async (
            newVal: AutoCompleteOption['val'] | undefined,
            bindingMetadata: BindingMetadata[]
        ) => {
            const bindingMetadataExists = hasLength(bindingMetadata);

            if (!bindingMetadataExists) {
                return Promise.resolve();
            }

            const invalidBindingIndex = bindingMetadata.findIndex(
                ({ bindingIndex }) => bindingIndex === -1
            );

            if (
                !draftId ||
                !mutateDraftSpecs ||
                draftSpecs.length === 0 ||
                invalidBindingIndex > -1
            ) {
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

            const spec: Schema = draftSpecs[0].spec;

            bindingMetadata.forEach(({ bindingIndex }) => {
                if (bindingIndex > -1) {
                    updateSchema(spec.bindings[bindingIndex], newVal);
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
