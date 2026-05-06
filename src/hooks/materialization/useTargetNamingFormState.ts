import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import {
    buildBothExamples,
    hasSchemaTemplate,
    hasTableTemplate,
    isStrategyKeyValid,
    isStrategyValid,
    parseExampleCollection,
    parseSchemaTemplate,
    parseTableTemplate,
    SCHEMA_TEMPLATE_STRING,
    TABLE_TEMPLATE_STRING,
} from 'src/components/materialization/targetNaming/shared';

export function useTargetNamingFormState(
    initialStrategy?: TargetNamingStrategy | null,
    exampleCollections?: string[]
) {
    const [strategyKey, setStrategyKey] = useState<StrategyKey>(
        initialStrategy?.strategy ?? 'matchSourceStructure'
    );

    const [schema, setSchema] = useState<string>(
        initialStrategy && initialStrategy.strategy !== 'matchSourceStructure'
            ? (initialStrategy.schema ?? '')
            : ''
    );

    const [skipCommonDefaults, setSkipCommonDefaults] = useState<boolean>(
        initialStrategy?.strategy === 'prefixTableNames'
            ? (initialStrategy.skipCommonDefaults ?? true)
            : true
    );

    const [matchSourceTemplatesEnabled, setMatchSourceTemplatesEnabled] =
        useState(
            initialStrategy?.strategy === 'matchSourceStructure' &&
                (hasSchemaTemplate(initialStrategy) ||
                    hasTableTemplate(initialStrategy))
        );

    const [schemaMode, setSchemaMode] = useState<'fixed' | 'template'>(
        initialStrategy?.strategy === 'prefixTableNames' ||
            initialStrategy?.strategy === 'singleSchema'
            ? 'fixed'
            : 'template'
    );
    const parsedSchema = parseSchemaTemplate(initialStrategy);
    const [schemaPrefix, setSchemaPrefix] = useState(parsedSchema.prefix);
    const [schemaSuffix, setSchemaSuffix] = useState(parsedSchema.suffix);
    const schemaTemplate =
        schemaMode === 'template'
            ? `${schemaPrefix}${SCHEMA_TEMPLATE_STRING}${schemaSuffix}`
            : undefined;

    const [tableMode, setTableMode] = useState<'fixed' | 'template'>(
        'template'
    );
    const parsedTable = parseTableTemplate(initialStrategy);
    const [tablePrefix, setTablePrefix] = useState(parsedTable.prefix);
    const [tableSuffix, setTableSuffix] = useState(parsedTable.suffix);
    const [tableValue, setTableValue] = useState<string>(
        !hasTableTemplate(initialStrategy) &&
            initialStrategy?.strategy === 'matchSourceStructure' &&
            initialStrategy.tableTemplate
            ? initialStrategy.tableTemplate
            : ''
    );
    const tableTemplate =
        tableMode === 'template'
            ? `${tablePrefix}${TABLE_TEMPLATE_STRING}${tableSuffix}`
            : tableValue.trim() || undefined;

    const { srcSchema, srcTable, sourceName } = parseExampleCollection(
        exampleCollections?.[0]
    );
    const { example, publicExample } = buildBothExamples(
        strategyKey,
        schema,
        schemaTemplate,
        tableTemplate,
        skipCommonDefaults,
        matchSourceTemplatesEnabled,
        srcSchema,
        srcTable,
        sourceName
    );

    const isKeyValid = isStrategyKeyValid(strategyKey);
    const canSubmitForm = isStrategyValid(strategyKey, schemaMode, schema);

    const sharedSchemaInputProps = {
        value: schema,
        onChange: setSchema,
        prefix: schemaPrefix,
        onPrefixChange: setSchemaPrefix,
        suffix: schemaSuffix,
        onSuffixChange: setSchemaSuffix,
        mode: schemaMode,
    };

    const sharedTableInputProps = {
        field: 'table' as const,
        tokenString: example.sourceTable,
        mode: tableMode,
        value: tableValue,
        onChange: setTableValue,
        prefix: tablePrefix,
        onPrefixChange: setTablePrefix,
        suffix: tableSuffix,
        onSuffixChange: setTableSuffix,
    };

    return {
        strategyKey,
        setStrategyKey,
        schema,
        skipCommonDefaults,
        setSkipCommonDefaults,
        matchSourceTemplatesEnabled,
        setMatchSourceTemplatesEnabled,
        schemaMode,
        setSchemaMode,
        schemaPrefix,
        schemaSuffix,
        tableMode,
        setTableMode,
        tablePrefix,
        tableSuffix,
        tableValue,
        schemaTemplate,
        tableTemplate,
        example,
        publicExample,
        isKeyValid,
        canSubmitForm,
        sharedSchemaInputProps,
        sharedTableInputProps,
    };
}
