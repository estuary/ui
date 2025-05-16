import type { Schema } from 'src/types';
import type { Projections } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { omit } from 'lodash';

import {
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'src/api/draftSpecs';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';

const getExistingPartition = (spec: Schema, location: string) => {
    const existingProjection = spec?.projections
        ? Object.entries(spec.projections as Projections).find(
              ([_projectedField, projectedMetadata]) =>
                  typeof projectedMetadata === 'string'
                      ? projectedMetadata === location
                      : projectedMetadata.location === location
          )
        : undefined;

    if (!existingProjection || typeof existingProjection[1] === 'string') {
        return undefined;
    }

    return existingProjection[1].partition;
};

export const useUpdateDraftedProjection = () => {
    const draftId = useEditorStore_persistedDraftId();

    const removeSingleProjection = useCallback(
        async (collection: string, field: string) => {
            if (!draftId) {
                return Promise.reject();
            }

            const { data, error } = await getDraftSpecsByCatalogName(
                draftId,
                collection,
                'collection'
            );

            const draftSpec = data?.at(0);

            if (error || !draftSpec) {
                return Promise.reject();
            }

            const spec: Schema = draftSpec.spec;

            if (spec?.projections) {
                spec.projections = omit(spec.projections, field);
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve();
        },
        [draftId]
    );

    const storeSingleProjection = useCallback(
        async (
            collection: string,
            field: string,
            location: string,
            partition?: boolean
        ) => {
            if (!draftId) {
                return Promise.reject();
            }

            const { data, error } = await getDraftSpecsByCatalogName(
                draftId,
                collection,
                'collection'
            );

            const draftSpec = data?.at(0);

            if (error || !draftSpec) {
                return Promise.reject();
            }

            const spec: Schema = draftSpec.spec;

            if (spec?.projections) {
                spec.projections[field] = {
                    location,
                    partition:
                        partition ?? getExistingPartition(spec, location),
                };
            } else {
                spec.projections = { [field]: { location, partition } };
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: 'collection',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return Promise.resolve();
        },
        [draftId]
    );

    return { removeSingleProjection, storeSingleProjection };
};
