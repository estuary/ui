import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type {
    AutoCompleteOptionForTargetSchemaExample,
    ParseTemplateResponse,
} from 'src/components/materialization/targetNaming/types';
import type { TargetNamingStrategy } from 'src/types';

export const SCHEMA_TEMPLATE_STRING = '{{schema}}';
export const TABLE_TEMPLATE_STRING = '{{table}}';

// Match i18n keys defaults.schema / defaults.table in CommonMessages.ts
export const EXAMPLE_SCHEMA_DEFAULT = 'anvils';
export const EXAMPLE_TABLE_DEFAULT = 'orders';

export const VALID_STRATEGY_KEYS: StrategyKey[] = [
    'matchSourceStructure',
    'singleSchema',
    'prefixTableNames',
];

export function isStrategyKeyValid(strategyKey: StrategyKey): boolean {
    return VALID_STRATEGY_KEYS.includes(strategyKey);
}

export function isStrategyValid(
    strategyKey: StrategyKey,
    schemaValue: string
): boolean {
    if (!isStrategyKeyValid(strategyKey)) {
        return false;
    }
    if (strategyKey === 'matchSourceStructure') {
        return true;
    }
    return schemaValue.trim().length > 0;
}

export function hasSchemaTemplate(
    s: TargetNamingStrategy | null | undefined
): s is Extract<TargetNamingStrategy, { schemaTemplate?: string }> & {
    schemaTemplate: string;
} {
    return (
        !!s &&
        'schemaTemplate' in s &&
        typeof s.schemaTemplate === 'string' &&
        s.schemaTemplate.length > 0
    );
}

export function hasValidSchemaTemplate(
    s: TargetNamingStrategy | null | undefined
): s is Extract<TargetNamingStrategy, { schemaTemplate?: string }> & {
    schemaTemplate: string;
} {
    return (
        hasSchemaTemplate(s) &&
        s.schemaTemplate.length > SCHEMA_TEMPLATE_STRING.length &&
        s.schemaTemplate.includes(SCHEMA_TEMPLATE_STRING)
    );
}

export function hasTableTemplate(
    s: TargetNamingStrategy | null | undefined
): s is TargetNamingStrategy & { tableTemplate: string } {
    return (
        !!s &&
        'tableTemplate' in s &&
        typeof s.tableTemplate === 'string' &&
        s.tableTemplate.length > 0
    );
}

export function hasValidTableTemplate(
    s: TargetNamingStrategy | null | undefined
): s is TargetNamingStrategy & { tableTemplate: string } {
    return (
        hasTableTemplate(s) &&
        s.tableTemplate.length > TABLE_TEMPLATE_STRING.length &&
        s.tableTemplate.includes(TABLE_TEMPLATE_STRING)
    );
}

const defaultResponse = {
    prefix: '',
    suffix: '',
    rawTemplate: null,
    invalid: false,
};
export function parseSchemaTemplate(
    strategy: TargetNamingStrategy | null | undefined
): ParseTemplateResponse {
    if (!hasSchemaTemplate(strategy)) {
        return defaultResponse;
    }

    const rawTemplate = strategy.schemaTemplate;

    if (hasValidSchemaTemplate(strategy)) {
        const parts = rawTemplate.split(SCHEMA_TEMPLATE_STRING);
        return {
            prefix: parts[0] ?? '',
            suffix: parts[1] ?? '',
            rawTemplate,
            invalid: false,
        };
    }

    return { ...defaultResponse, rawTemplate, invalid: true };
}

export function parseTableTemplate(
    strategy: TargetNamingStrategy | null | undefined
): ParseTemplateResponse {
    if (!hasTableTemplate(strategy)) {
        return defaultResponse;
    }

    const rawTemplate = strategy.tableTemplate;

    if (hasValidTableTemplate(strategy)) {
        const parts = rawTemplate.split(TABLE_TEMPLATE_STRING);
        return {
            prefix: parts[0] ?? '',
            suffix: parts[1] ?? '',
            rawTemplate,
            invalid: false,
        };
    }

    return { prefix: '', suffix: '', rawTemplate, invalid: true };
}

export function buildStrategyFromState(
    strategyKey: StrategyKey,
    schemaValue: string,
    tableValue: string,
    skipCommonDefaults: boolean,
    templatesEnabled: boolean
): TargetNamingStrategy {
    if (strategyKey === 'matchSourceStructure') {
        const strategy: TargetNamingStrategy = {
            strategy: 'matchSourceStructure',
        };
        if (templatesEnabled) {
            if (schemaValue) {
                strategy.schemaTemplate = schemaValue;
            }
            if (tableValue) {
                strategy.tableTemplate = tableValue;
            }
        }
        return strategy;
    }

    if (strategyKey === 'singleSchema') {
        const strategy: TargetNamingStrategy = {
            strategy: 'singleSchema',
            schema: schemaValue.trim(),
        };
        if (tableValue) {
            strategy.tableTemplate = tableValue;
        }
        return strategy;
    }

    const strategy: TargetNamingStrategy = {
        strategy: 'prefixTableNames',
        schema: schemaValue.trim(),
        skipCommonDefaults,
    };
    if (tableValue) {
        strategy.tableTemplate = tableValue;
    }
    return strategy;
}

export function parseExampleCollection(collection: string | undefined): {
    srcSchema: string;
    srcTable: string;
    sourceName: string | undefined;
} {
    const parts = collection?.split('/') ?? [];
    return {
        srcSchema:
            parts.length >= 2
                ? (parts[parts.length - 2] ?? EXAMPLE_SCHEMA_DEFAULT)
                : EXAMPLE_SCHEMA_DEFAULT,
        srcTable:
            parts.length >= 1
                ? (parts[parts.length - 1] ?? EXAMPLE_TABLE_DEFAULT)
                : EXAMPLE_TABLE_DEFAULT,
        sourceName: collection,
    };
}

export function extractStrategyFields(strategy: TargetNamingStrategy | null): {
    schema: string;
    skipCommonDefaults: boolean;
    schemaTemplate: string | undefined;
    tableTemplate: string | undefined;
} {
    if (!strategy) {
        return {
            schema: '',
            schemaTemplate: undefined,
            tableTemplate: undefined,
            skipCommonDefaults: true,
        };
    }
    return {
        schema: 'schema' in strategy ? (strategy.schema ?? '') : '',
        skipCommonDefaults:
            'skipCommonDefaults' in strategy
                ? (strategy.skipCommonDefaults ?? true)
                : true,
        schemaTemplate: hasSchemaTemplate(strategy)
            ? strategy.schemaTemplate
            : undefined,
        tableTemplate: hasTableTemplate(strategy)
            ? strategy.tableTemplate
            : undefined,
    };
}

export function buildBothExamples(
    strategyKey: StrategyKey,
    schema: string,
    schemaTemplate: string | undefined,
    tableTemplate: string | undefined,
    skipCommonDefaults: boolean,
    applyCustomNaming: boolean,
    srcSchema: string = EXAMPLE_SCHEMA_DEFAULT,
    srcTable: string = EXAMPLE_TABLE_DEFAULT,
    sourceName?: string
): {
    example: ReturnType<typeof buildExample>;
    publicExample: ReturnType<typeof buildExample>;
} {
    const exSchemaTemplate =
        strategyKey === 'matchSourceStructure' && applyCustomNaming
            ? schemaTemplate
            : undefined;
    const exTableTemplate =
        strategyKey !== 'matchSourceStructure' || applyCustomNaming
            ? tableTemplate
            : undefined;
    const publicSourceName = sourceName
        ? sourceName.replace(`/${srcSchema}/`, '/public/')
        : undefined;

    return {
        example: buildExample(
            strategyKey,
            schema,
            exSchemaTemplate,
            exTableTemplate,
            skipCommonDefaults,
            srcSchema,
            srcTable,
            sourceName
        ),
        publicExample: buildExample(
            strategyKey,
            schema,
            exSchemaTemplate,
            exTableTemplate,
            skipCommonDefaults,
            'public',
            srcTable,
            publicSourceName
        ),
    };
}

export function buildExample(
    strategyKey: StrategyKey,
    schema: string,
    schemaTemplate: string | undefined,
    tableTemplate: string | undefined,
    skipCommonDefaults: boolean,
    sourceSchema: string = EXAMPLE_SCHEMA_DEFAULT,
    sourceTable: string = EXAMPLE_TABLE_DEFAULT,
    sourceName?: string
): AutoCompleteOptionForTargetSchemaExample {
    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace(SCHEMA_TEMPLATE_STRING, sourceSchema)
            : fallback || '...';

    const resolveTable = (fallback: string) =>
        tableTemplate
            ? tableTemplate.replace(TABLE_TEMPLATE_STRING, fallback)
            : fallback;

    // Pass back the original values to make plumbing them through easier.
    const providedSettings = {
        sourceName,
        sourceTable,
        sourceSchema,
    };

    switch (strategyKey) {
        case 'matchSourceStructure':
            return {
                ...providedSettings,
                schema: resolveSchema(sourceSchema),
                table: resolveTable(sourceTable),
                tablePrefix: sourceSchema,
            };
        case 'singleSchema':
            return {
                ...providedSettings,
                schema: resolveSchema(schema),
                table: resolveTable(sourceTable),
                tablePrefix: sourceSchema,
            };
        case 'prefixTableNames': {
            const isDefault = ['public', 'dbo'].includes(sourceSchema);
            const prefix =
                skipCommonDefaults && isDefault ? '' : `${sourceSchema}_`;

            return {
                ...providedSettings,
                schema: resolveSchema(schema),
                table: resolveTable(`${prefix}${sourceTable}`),
                tablePrefix: sourceSchema,
            };
        }
    }
}
