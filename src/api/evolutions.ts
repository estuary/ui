import { DEFAULT_FILTER, insertSupabase, TABLES } from 'services/supabase';
import { incrementCollectionNames } from 'utils/name-utils';

// Evolution starts by the publish returning this object in job_status['incompatible_collections']
export interface IncompatibleCollections {
    collection: string;
    affected_materializations: {
        name: string;
        fields: {
            field: string;
            reason: string;
        }[];
    }[];
}

// TODO (schema evolution) we do not use this response yet as we do not manually check
//  or display any information to the user about which things were updated.
// Evolution success will return this object in job_status['evolved_collections']
export interface EvolvedCollections {
    new_name: string;
    old_name: string;
    updated_captures: string[];
    updated_materializations: string[];
}

export const createEvolution = (
    draftId: string | null,
    collectionNames: string[]
) => {
    const collections = incrementCollectionNames(collectionNames);

    return insertSupabase(TABLES.EVOLUTIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        collections,
    });
};
