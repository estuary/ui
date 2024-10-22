import { modifyDraftSpec } from 'api/draftSpecs';
import { AutoCompleteOption } from 'components/editor/Bindings/OnIncompatibleSchemaChange/types';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { useBinding_bindings } from 'stores/Binding/hooks';
import { BindingMetadata, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getBindingIndex } from 'utils/workflow-utils';

const updateSchema = (binding: any, newVal: any) => {
    if (newVal) {
        binding.onIncompatibleSchemaChange = newVal;
    } else {
        delete binding.onIncompatibleSchemaChange;
    }
};

function useUpdateOnIncompatibleSchemaChange() {
    const intl = useIntl();
    const entityType = useEntityType();

    // Binding Store
    const bindings = useBinding_bindings();

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

            const invalidBindingIndex = bindingMetadataExists
                ? bindingMetadata.findIndex(
                      ({ bindingIndex }) => bindingIndex === -1
                  )
                : -1;

            if (
                !draftId ||
                !mutateDraftSpecs ||
                draftSpecs.length === 0 ||
                invalidBindingIndex > -1
            ) {
                // TODO (onschema) update message
                const errorMessageId = bindingMetadataExists
                    ? 'workflows.collectionSelector.manualBackfill.error.message.singleCollection'
                    : 'workflows.collectionSelector.manualBackfill.error.message.allBindings';

                const errorMessageValues = bindingMetadataExists
                    ? {
                          collection:
                              bindingMetadata[invalidBindingIndex].collection,
                      }
                    : undefined;

                return Promise.reject({
                    ...BASE_ERROR,
                    message: intl.formatMessage(
                        { id: errorMessageId },
                        errorMessageValues
                    ),
                });
            }

            const spec: Schema = draftSpecs[0].spec;

            if (bindingMetadataExists) {
                bindingMetadata.forEach(({ bindingIndex }) => {
                    if (bindingIndex > -1) {
                        updateSchema(spec.bindings[bindingIndex], newVal);
                    }
                });
            } else {
                Object.entries(bindings).forEach(
                    ([collection, bindingUUIDs]) => {
                        bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                            const existingBindingIndex = getBindingIndex(
                                spec.bindings,
                                collection,
                                iteratedIndex
                            );

                            if (existingBindingIndex > -1) {
                                updateSchema(
                                    spec.bindings[existingBindingIndex],
                                    newVal
                                );
                            }
                        });
                    }
                );
            }

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
        [bindings, draftId, draftSpecs, entityType, intl, mutateDraftSpecs]
    );

    return { updateOnIncompatibleSchemaChange };
}

export default useUpdateOnIncompatibleSchemaChange;
