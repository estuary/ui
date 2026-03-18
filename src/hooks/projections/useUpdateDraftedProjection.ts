import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { useIntl } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore_collectionData } from 'src/components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { BASE_ERROR } from 'src/services/supabase';
import { getExistingPartition } from 'src/utils/entity-utils';

export const useUpdateDraftedProjection = () => {
    const intl = useIntl();
    const draftId = useEditorStore_persistedDraftId();
    const collectionData = useBindingsEditorStore_collectionData();

    const removeSingleProjection = useCallback(
        async (collection: string, field: string) => {
            if (!draftId || !collectionData) {
                return Promise.reject(
                    'draft ID or stored draft spec not found'
                );
            }

            const spec: Schema = collectionData.spec;

            if (spec?.projections) {
                delete spec.projections[field];
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: collection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve();
        },
        [collectionData, draftId]
    );

    const setSingleProjection = useCallback(
        async (
            collection: string,
            field: string,
            location: string,
            partition?: boolean
        ) => {
            if (!draftId || !collectionData) {
                return Promise.reject({
                    ...BASE_ERROR,
                    message: intl.formatMessage({
                        id: 'projection.error.alert.draftId',
                    }),
                });
            }

            const spec: Schema = collectionData.spec;

            spec.projections ??= {};

            if (Object.hasOwn(spec.projections, field)) {
                return Promise.reject({
                    ...BASE_ERROR,
                    message: intl.formatMessage(
                        { id: 'projection.error.alert.duplicate' },
                        {
                            duplicateLocation: spec.projections[field].location,
                        }
                    ),
                });
            }

            spec.projections[field] = {
                location,
                partition:
                    partition ?? getExistingPartition(spec, location, field),
            };

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: collection,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve();
        },
        [collectionData, draftId, intl]
    );

    return { removeSingleProjection, setSingleProjection };
};
