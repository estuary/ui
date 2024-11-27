import produce from 'immer';
import { isEqual } from 'lodash';
import { SourceCaptureDef } from 'types';
import { Nullable } from 'types/utils';
import { specContainsDerivation } from 'utils/misc-utils';

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
): Nullable<SourceCaptureDef> => {
    if (!sourceCapture) {
        return {
            capture: null,
            deltaUpdates: null,
            targetSchema: null,
        };
    }

    if (typeof sourceCapture === 'string') {
        return {
            capture: sourceCapture,
            deltaUpdates: null,
            targetSchema: null,
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

// Just ALWAYS call the get function so the calling function
//  does not need to worry about that;
export const hasSourceCaptureChanged = (
    existingSourceCapture: Nullable<SourceCaptureDef> | null | undefined,
    sourceCapture: Nullable<SourceCaptureDef> | null | undefined
) => !isEqual(existingSourceCapture, sourceCapture);
