import type { Schema } from 'src/types';
import type { BuiltCollection } from 'src/types/schemaModels';
import type { ResolvedBuiltCollections } from 'src/types/wasm';

import { resolve_built_collections } from '@estuary/flow-web';

// Results are kept for as long as their built spec object is, so that
// flow-web is called once for each built spec.
const builtCollections = new WeakMap<Schema, (BuiltCollection | undefined)[]>();

// The collection of each binding of a built materialization, in binding
// order. A built spec names those collections inline or through a shared
// table, and flow-web decides which applies.
//
// The time flow-web takes grows with the size of the spec it is given, and
// almost all of that size is collections. So it is given only what decides
// the answer: the `collection` and `collectionIndex` of each binding and the
// table, with a numbered stand-in in place of every collection.
export const getBuiltCollections = (
    builtSpec: Schema | null
): (BuiltCollection | undefined)[] => {
    if (!builtSpec) {
        return [];
    }

    let resolved = builtCollections.get(builtSpec);

    if (!resolved) {
        const originals: BuiltCollection[] = [];
        const standIn = (collection: BuiltCollection) => {
            originals.push(collection);
            return { name: String(originals.length - 1) };
        };

        const { collections, bindings }: ResolvedBuiltCollections =
            resolve_built_collections({
                specType: 'materialization',
                builtSpec: {
                    bindings: builtSpec.bindings?.map((binding: Schema) => ({
                        collection:
                            binding.collection && standIn(binding.collection),
                        collectionIndex: binding.collectionIndex,
                    })),
                    linkedCollections:
                        builtSpec.linkedCollections?.map(standIn),
                },
            });

        resolved = bindings.map((index) =>
            index === null
                ? undefined
                : originals[Number(collections[index].name)]
        );

        builtCollections.set(builtSpec, resolved);
    }

    return resolved;
};

export const getBuiltBindingIndex = (
    builtSpec: Schema,
    targetCollection: string
): number =>
    getBuiltCollections(builtSpec).findIndex(
        (collection) => collection?.name === targetCollection
    );
