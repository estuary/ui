import type { Schema, SourceCaptureDef } from 'src/types';
import type { Projections } from 'src/types/schemaModels';

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

export const getSourceCapturePropKey = (draftSpec: any) => {
    // If we got the old key on the spec then return that
    if (draftSpec?.sourceCapture) {
        return 'sourceCapture';
    }

    // Otherwise use the new key
    return 'source';
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

export const readSourceCaptureDefinitionFromSpec = (schema: Schema) => {
    return getSourceCapture(schema[getSourceCapturePropKey(schema)]);
};

export const addOrRemoveSourceCapture = (
    schema: Schema,
    sourceCapture: SourceCaptureDef | null
) => {
    if (sourceCapture) {
        // Use the old option of that is what is there
        if (schema.sourceCapture) {
            schema.sourceCapture = sourceCapture;
        } else {
            schema.source = sourceCapture;
        }
    } else {
        delete schema.source;
        delete schema.sourceCapture;
    }

    return schema;
};

export const updateSourceCapture = (
    schema: Schema,
    sourceCaptureSettings: SourceCaptureDef
): Schema => {
    const currentKey = getSourceCapturePropKey(schema);
    const currentVal = readSourceCaptureDefinitionFromSpec(schema) ?? {};

    // See if the old targetNaming property is being used. Since we are updating sourceCapture we can
    //  go ahead and convert to the new setting
    if (Object.hasOwn(currentVal, 'targetSchema')) {
        // If there is not targetNaming do ahead and populate the previous setting into the new prop name
        if (!Object.hasOwn(sourceCaptureSettings, 'targetNaming')) {
            sourceCaptureSettings.targetNaming = currentVal.targetSchema;
        }

        // Clean up the old targetSchema so we don't have duplicate keys
        delete currentVal.targetSchema;
    }

    schema[currentKey] = { ...currentVal, ...sourceCaptureSettings };

    return schema;
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

export const getExistingPartition = (
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

export const isTaskDisabled = (spec: any) => {
    return Boolean(spec?.shards?.disable);
};
