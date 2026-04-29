import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

export const SCHEMA_TEMPLATE_STRING = '{{schema}}';
export const TABLE_TEMPLATE_STRING = '{{table}}';

export function hasSchemaTemplate(
    s: TargetNamingStrategy | null | undefined
): s is Extract<TargetNamingStrategy, { schemaTemplate?: string }> & {
    schemaTemplate: string;
} {
    return (
        !!s &&
        'schemaTemplate' in s &&
        typeof s.schemaTemplate === 'string' &&
        s.schemaTemplate.length > 0 &&
        s.schemaTemplate !== SCHEMA_TEMPLATE_STRING
    );
}

export function hasTableTemplate(
    s: TargetNamingStrategy | null | undefined
): s is TargetNamingStrategy & { tableTemplate: string } {
    return (
        !!s &&
        'tableTemplate' in s &&
        typeof s.tableTemplate === 'string' &&
        s.tableTemplate.length > 0 &&
        s.tableTemplate !== TABLE_TEMPLATE_STRING
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

export function buildExample(
    strategyKey: StrategyKey,
    schema: string,
    schemaTemplate: string | undefined,
    tableTemplate: string | undefined,
    skipCommonDefaults: boolean,
    srcSchema: string = 'anvils',
    srcTable: string = 'orders',
    sourceName?: string
): { schema: string; table: string; tablePrefix: string; sourceName?: string } {
    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace(SCHEMA_TEMPLATE_STRING, srcSchema)
            : fallback || '_';

    const resolveTable = (fallback: string) =>
        tableTemplate
            ? tableTemplate.replace(TABLE_TEMPLATE_STRING, fallback)
            : fallback;

    switch (strategyKey) {
        case 'matchSourceStructure':
            return {
                schema: resolveSchema(srcSchema),
                table: resolveTable(srcTable),
                tablePrefix: srcSchema,
                sourceName,
            };
        case 'singleSchema':
            return {
                schema: resolveSchema(schema),
                table: resolveTable(srcTable),
                tablePrefix: srcSchema,
                sourceName,
            };
        case 'prefixTableNames': {
            const isDefault = ['public', 'dbo'].includes(srcSchema);
            const prefix =
                skipCommonDefaults && isDefault ? '' : `${srcSchema}_`;

            return {
                schema: resolveSchema(schema),
                table: resolveTable(`${prefix}${srcTable}`),
                tablePrefix: srcSchema,
                sourceName,
            };
        }
    }
}
