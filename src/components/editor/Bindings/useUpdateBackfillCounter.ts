import { modifyDraftSpec } from 'api/draftSpecs';
import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { omit } from 'lodash';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Schema } from 'types';
import { getBackfillCounter } from 'utils/workflow-utils';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from '../Store/hooks';
import { BooleanString } from './ManualBackfill';

function useUpdateBackfillCounter() {
    const intl = useIntl();
    const entityType = useEntityType();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateBackfillCounter = useCallback(
        async (
            draftSpec: DraftSpecQuery,
            bindingIndex: number,
            increment: BooleanString,
            collection: string
        ) => {
            if (!mutateDraftSpecs || bindingIndex === -1) {
                // TODO: Extend the type of the error object accepted by setFormState to include strings.
                //   Currently, this action only accepts a PostgresError object.
                return Promise.reject({
                    message: intl.formatMessage(
                        {
                            id: 'workflows.collectionSelector.manualBackfill.error.message',
                        },
                        { collection }
                    ),
                    details: '',
                    hint: '',
                    code: '',
                });
            }

            const spec: Schema = draftSpec.spec;
            let counter = getBackfillCounter(spec.bindings[bindingIndex]);

            if (increment === 'true') {
                counter = counter + 1;
            } else if (counter > 0) {
                counter = counter - 1;
            }

            // TODO: Determine if setting the backfill counter to zero is the same as removing the property entirely.
            if (counter > 0) {
                spec.bindings[bindingIndex].backfill = counter;
            } else {
                // Remove the backfill property from the specification if it equates to default behavior.
                spec.bindings[bindingIndex] = omit(
                    spec.bindings[bindingIndex],
                    'backfill'
                );
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: entityType,
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, entityType, intl, mutateDraftSpecs]
    );

    return { updateBackfillCounter };
}

export default useUpdateBackfillCounter;
