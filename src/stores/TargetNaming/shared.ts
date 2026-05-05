import type { TargetNamingModel } from 'src/types';

// TODO (target naming:post migration:update) - we can remove this but we'll need to go through
//  and update it so we no longer have to check for `rootTargetNaming`

// Detect which model version is present in a raw draft spec object.
// Returns null when the connector does not support x_schema_name (caller
// should check sourceCaptureTargetSchemaSupported before calling this).
export const detectTargetNamingModel = (
    spec: Record<string, any>
): Exclude<TargetNamingModel, null> => {
    if (spec?.targetNaming && typeof spec.targetNaming === 'object') {
        return 'rootTargetNaming';
    }
    // Only use sourceTargetNaming when source.targetNaming is explicitly present.
    // Specs with no targetNaming anywhere get the new rootTargetNaming UI.
    const sourceKey = spec?.sourceCapture ? 'sourceCapture' : 'source';
    if (spec?.[sourceKey]?.targetNaming) {
        return 'sourceTargetNaming';
    }
    return 'rootTargetNaming';
};
