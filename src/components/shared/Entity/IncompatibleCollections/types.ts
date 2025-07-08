import type { EvolutionRequest } from 'src/api/evolutions';

export interface AffectedMaterialization {
    name: string;
    fields: {
        field: string;
        reason: string;
    }[];
}

// Evolution starts by the publish returning this object in job_status['incompatible_collections']
export interface IncompatibleCollections {
    collection: string;
    requires_recreation: RequiresRecreation[];
    affected_materializations?: AffectedMaterialization[];
}

export type RequiresRecreation =
    // The collection key in the draft differs from that of the live spec.
    | 'keyChange'
    // One or more collection partition fields in the draft differs from that of the live spec.
    | 'partitionChange'
    // This variant is deprecated and removed from the latest version of the agent. It's retained here
    // only to temporarily ensure compatibility between the agent and the UI, and can be removed once
    // the agent changes make it into production.
    | 'authoritativeSourceSchema';

export type ValidHelpMessageId =
    // Handles every update that is not resetting the collection
    | 'fallThrough'
    // A reason was returned
    | 'resetCollection';

export interface CollectionActionProps {
    incompatibleCollection: IncompatibleCollections;
}

export interface IncompatibleCollectionsGrouping {
    evolutionRequest: EvolutionRequest;
    helpMessageId: ValidHelpMessageId;
}

export interface ProcessedIncompatibleCollections {
    keyChange: IncompatibleCollectionsGrouping[];
    partitionChange: IncompatibleCollectionsGrouping[];
    authoritativeSourceSchema: IncompatibleCollectionsGrouping[];
    fallThrough: IncompatibleCollectionsGrouping[];
}
