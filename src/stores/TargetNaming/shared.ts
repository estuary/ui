import type { TargetSchemas } from 'src/stores/SourceCapture/types';
import type { TargetNamingModel, TargetNamingStrategy } from 'src/types';

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

// Map an old TargetSchemas string to the nearest TargetNamingStrategy.
// Used when displaying the dialog in edit mode for a sourceTargetNaming spec.
// Note: singleSchema requires a schema name — pass the current connector
// default schema if known, otherwise empty string (user must fill it in).
export const oldStringToStrategy = (
    old: TargetSchemas | undefined,
    defaultSchema = ''
): TargetNamingStrategy => {
    switch (old) {
        case 'withSchema':
        case 'fromSourceName': // legacy alias
            return { strategy: 'matchSourceStructure' };
        case 'prefixNonDefaultSchema':
            return {
                strategy: 'prefixTableNames',
                schema: defaultSchema,
                skipCommonDefaults: true,
            };
        case 'prefixSchema':
            return {
                strategy: 'prefixTableNames',
                schema: defaultSchema,
                skipCommonDefaults: false,
            };
        case 'noSchema':
        case 'leaveEmpty': // legacy alias
            return { strategy: 'singleSchema', schema: defaultSchema };
        default:
            // prefixNonDefaultSchema was the backend default
            return {
                strategy: 'prefixTableNames',
                schema: defaultSchema,
                skipCommonDefaults: true,
            };
    }
};

// Map a TargetNamingStrategy back to the old string for sourceTargetNaming edit writes.
export const strategyToOldString = (
    strategy: TargetNamingStrategy
): TargetSchemas => {
    switch (strategy.strategy) {
        case 'matchSourceStructure':
            return 'withSchema';
        case 'singleSchema':
            return 'noSchema';
        case 'prefixTableNames':
            return strategy.skipCommonDefaults
                ? 'prefixNonDefaultSchema'
                : 'prefixSchema';
    }
};
