import type { Schema } from 'src/types';
import type { BuiltCollection } from 'src/types/schemaModels';
import type { ResolvedBuiltCollections } from 'src/types/wasm';

import { resolve_built_collections } from '@estuary/flow-web';

import { logRocketEvent } from 'src/services/shared';

// Results are kept for as long as their built spec object is, so that
// flow-web is called once for each built spec.
const builtCollections = new WeakMap<Schema, (BuiltCollection | undefined)[]>();

// The collection of each binding of a built materialization, in binding order.
// Expects the camelCase JSON Flow writes to built_spec.
//
// Pass only the collection references and numbered stand-ins to keep full
// collection specs out of the WASM call.
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

        try {
            const { collections, bindings }: ResolvedBuiltCollections =
                resolve_built_collections({
                    specType: 'materialization',
                    builtSpec: {
                        bindings: builtSpec.bindings?.map(
                            (binding: Schema) => ({
                                collection:
                                    binding.collection &&
                                    standIn(binding.collection),
                                collectionIndex: binding.collectionIndex,
                            })
                        ),
                        linkedCollections:
                            builtSpec.linkedCollections?.map(standIn),
                    },
                });

            // Flow-web can reorder the table. Each stand-in's name indexes originals.
            resolved = bindings.map((index) =>
                index === null
                    ? undefined
                    : originals[Number(collections[index].name)]
            );
        } catch (error: unknown) {
            // Leave the bindings unresolved, so field selection asks for a
            // Refresh rather than the editor failing.
            logRocketEvent('resolve_built_collections', {
                failed: true,
                error: String(error),
            });
            resolved = [];
        }

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
