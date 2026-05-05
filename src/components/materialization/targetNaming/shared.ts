import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/source/targetSchema/types';
import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

export const SCHEMA_TEMPLATE_STRING = '{{schema}}';
export const TABLE_TEMPLATE_STRING = '{{table}}';

export const VALID_STRATEGY_KEYS: StrategyKey[] = [
    'matchSourceStructure',
    'singleSchema',
    'prefixTableNames',
];

export function isStrategyValid(
    strategyKey: StrategyKey,
    schemaMode: 'fixed' | 'template',
    schema: string
): boolean {
    if (!VALID_STRATEGY_KEYS.includes(strategyKey)) return false;
    if (strategyKey === 'matchSourceStructure') return true;
    return schemaMode === 'template' || schema.trim().length > 0;
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
        s.tableTemplate.length > TABLE_TEMPLATE_STRING.length &&
        s.tableTemplate.includes(TABLE_TEMPLATE_STRING)
    );
}

export function parseSchemaTemplate(template: string): {
    prefix: string;
    suffix: string;
} {
    const parts = template.split(SCHEMA_TEMPLATE_STRING);
    return { prefix: parts[0] ?? '', suffix: parts[1] ?? '' };
}

export function parseTableTemplate(template: string): {
    prefix: string;
    suffix: string;
} {
    const parts = template.split(TABLE_TEMPLATE_STRING);
    return { prefix: parts[0] ?? '', suffix: parts[1] ?? '' };
}

export function buildStrategyFromState(
    strategyKey: StrategyKey,
    schema: string,
    skipCommonDefaults: boolean,
    showMatchNaming: boolean,
    schemaTemplate: string | undefined,
    tableTemplate: string | undefined
): TargetNamingStrategy {
    if (strategyKey === 'matchSourceStructure') {
        const strategy: TargetNamingStrategy = {
            strategy: 'matchSourceStructure',
        };
        if (showMatchNaming) {
            if (schemaTemplate) strategy.schemaTemplate = schemaTemplate;
            if (tableTemplate) strategy.tableTemplate = tableTemplate;
        }
        return strategy;
    }

    if (strategyKey === 'singleSchema') {
        const strategy: TargetNamingStrategy = {
            strategy: 'singleSchema',
            schema: schema.trim(),
        };
        if (tableTemplate) strategy.tableTemplate = tableTemplate;
        return strategy;
    }

    const strategy: TargetNamingStrategy = {
        strategy: 'prefixTableNames',
        schema: schema.trim(),
        skipCommonDefaults,
    };
    if (tableTemplate) strategy.tableTemplate = tableTemplate;
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
                ? (parts[parts.length - 2] ?? 'anvils')
                : 'anvils',
        srcTable:
            parts.length >= 1
                ? (parts[parts.length - 1] ?? 'orders')
                : 'orders',
        sourceName: collection,
    };
}

export function extractStrategyFields(strategy: TargetNamingStrategy): {
    schema: string;
    skipCommonDefaults: boolean;
    schemaTemplate: string | undefined;
    tableTemplate: string | undefined;
} {
    return {
        schema: 'schema' in strategy ? (strategy.schema ?? '') : '',
        skipCommonDefaults:
            'skipCommonDefaults' in strategy
                ? (strategy.skipCommonDefaults ?? true)
                : true,
        schemaTemplate: hasSchemaTemplate(strategy)
            ? strategy.schemaTemplate
            : undefined,
        tableTemplate:
            'tableTemplate' in strategy &&
            typeof strategy.tableTemplate === 'string'
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
    srcSchema: string = 'anvils',
    srcTable: string = 'orders',
    sourceName?: string
): {
    example: ReturnType<typeof buildExample>;
    publicExample: ReturnType<typeof buildExample>;
} {
    const exSchemaTemplate =
        strategyKey !== 'matchSourceStructure' || applyCustomNaming
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
    sourceSchema: string = 'anvils',
    sourceTable: string = 'orders',
    sourceName?: string
): AutoCompleteOptionForTargetSchemaExample {
    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace(SCHEMA_TEMPLATE_STRING, sourceSchema)
            : fallback || '_';

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
