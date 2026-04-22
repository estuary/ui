import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

export function hasSchemaTemplate(
    s: TargetNamingStrategy | null | undefined
): s is Extract<TargetNamingStrategy, { schemaTemplate?: string }> & {
    schemaTemplate: string;
} {
    return (
        !!s &&
        s.strategy !== 'matchSourceStructure' &&
        'schemaTemplate' in s &&
        typeof s.schemaTemplate === 'string' &&
        s.schemaTemplate.length > 0
    );
}

export function parseSchemaTemplate(template: string): {
    prefix: string;
    suffix: string;
} {
    const parts = template.split('{{schema}}');
    return { prefix: parts[0] ?? '', suffix: parts[1] ?? '' };
}

export function buildExample(
    strategyKey: StrategyKey,
    schema: string,
    schemaTemplate: string | undefined,
    skipCommonDefaults: boolean,
    srcSchema: string = 'anvils'
): { schema: string; table: string; tablePrefix: string } {
    const srcTable = 'orders';

    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace('{{schema}}', srcSchema)
            : fallback || '_';

    switch (strategyKey) {
        case 'matchSourceStructure':
            return {
                schema: srcSchema,
                table: srcTable,
                tablePrefix: srcSchema,
            };
        case 'singleSchema':
            return {
                schema: resolveSchema(schema),
                table: srcTable,
                tablePrefix: srcSchema,
            };
        case 'prefixTableNames': {
            const isDefault = ['public', 'dbo'].includes(srcSchema);

            const prefix =
                skipCommonDefaults && isDefault ? '' : `${srcSchema}_`;

            return {
                schema: resolveSchema(schema),
                table: `${prefix}${srcTable}`,
                tablePrefix: srcSchema,
            };
        }
    }
}
