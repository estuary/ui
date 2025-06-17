import type {
    EvolutionRequest,
    IncompatibleCollections,
} from 'src/api/evolutions';

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
    // Somehow we did not get either a reason or a materialization list back so the server will need to figure it out
    | 'fallThrough'
    // No reason and multiple materializations
    | 'recreateBindings'
    // No reason but a single materialization in the list
    | 'recreateSingleBinding'
    // A reason was returned
    | 'resetCollection';

export interface CollectionActionProps {
    incompatibleCollection: IncompatibleCollections;
}

export interface DescriptionProps {
    recreateCause: RequiresRecreation | null;
    evolutionRequest: EvolutionRequest;
    helpMessageId: ValidHelpMessageId;
}
