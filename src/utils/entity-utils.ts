import type { Schema, SourceCaptureDef } from 'src/types';

import produce from 'immer';

import { hasLength, specContainsDerivation } from 'src/utils/misc-utils';

export const updateShardDisabled = (draftSpec: any, enabling: boolean) => {
    draftSpec.shards ??= {};
    draftSpec.shards.disable = !enabling;
};

export const generateDisabledSpec = (
    spec: any,
    enabling: boolean,
    shardsAreNested: boolean
) => {
    // Make sure we have a spec to update
    if (spec) {
        // Check if we need to place the settings deeper (collections)
        if (shardsAreNested) {
            const { isDerivation, derivationKey } =
                specContainsDerivation(spec);

            // Check if there is a derivation key we can update (derivations)
            //  if the collection is not a derivation then we cannot enable/disable
            if (isDerivation) {
                return produce<typeof spec>(spec, (draftSpec) => {
                    updateShardDisabled(draftSpec[derivationKey], enabling);
                });
            }
        } else {
            // Not nested so we can update the root (captures and materializations)
            return produce<typeof spec>(spec, (draftSpec) => {
                updateShardDisabled(draftSpec, enabling);
            });
        }
    }
};

export const getSourceCapture = (
    sourceCapture: SourceCaptureDef | string | null | undefined
): SourceCaptureDef | null => {
    if (!sourceCapture) {
        return null;
    }

    if (typeof sourceCapture === 'string') {
        return {
            capture: sourceCapture,
        };
    }

    return sourceCapture;
};

export const addOrRemoveSourceCapture = (
    draftSpec: any,
    sourceCapture: SourceCaptureDef | null
) => {
    if (sourceCapture) {
        draftSpec.sourceCapture = sourceCapture;
    } else {
        delete draftSpec.sourceCapture;
    }

    return draftSpec;
};

export const addOrRemoveOnIncompatibleSchemaChange = (
    schema: Schema,
    value: string | undefined
) => {
    if (hasLength(value)) {
        schema.onIncompatibleSchemaChange = value;
    } else {
        delete schema.onIncompatibleSchemaChange;
    }

    return schema;
};
