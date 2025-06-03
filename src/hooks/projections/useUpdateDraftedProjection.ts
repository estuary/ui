import type { Schema } from 'src/types';
import type { Projections } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { useBindingsEditorStore_collectionData } from 'src/components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';

const getExistingPartition = (
    spec: Schema,
    location: string,
    field: string
) => {
    const existingProjection = spec?.projections
        ? Object.entries(spec.projections as Projections).find(
              ([projectedField, projectedMetadata]) => {
                  const locationMatched =
                      typeof projectedMetadata === 'string'
                          ? projectedMetadata === location
                          : projectedMetadata.location === location;

                  return locationMatched && projectedField === field;
              }
          )
        : undefined;

    if (!existingProjection || typeof existingProjection[1] === 'string') {
        return undefined;
    }

    return existingProjection[1].partition;
};

export const useUpdateDraftedProjection = () => {
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
                return Promise.reject(
                    'draft ID or stored draft spec not found'
                );
            }

            const spec: Schema = collectionData.spec;

            spec.projections ??= {};

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
        [collectionData, draftId]
    );

    return { removeSingleProjection, setSingleProjection };
};
