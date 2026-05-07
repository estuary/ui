import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import {
    buildBothExamples,
    hasSchemaTemplate,
    hasTableTemplate,
    initialSchemaValue,
    initialTableValue,
    isStrategyKeyValid,
    isStrategyValid,
    parseExampleCollection,
} from 'src/components/materialization/targetNaming/shared';

export function useTargetNamingFormState(
    initialStrategy?: TargetNamingStrategy | null,
    exampleCollections?: string[]
) {
    const [strategyKey, setStrategyKey] = useState<StrategyKey>(
        initialStrategy?.strategy ?? 'matchSourceStructure'
    );

    const [schemaValue, setSchemaValue] = useState<string>(() =>
        initialSchemaValue(initialStrategy)
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

    const [tableValue, setTableValue] = useState<string>(() =>
        initialTableValue(initialStrategy)
    );

    const schemaTemplate = schemaValue.trim() || undefined;
    const tableTemplate = tableValue.trim() || undefined;

    const { srcSchema, srcTable, sourceName } = parseExampleCollection(
        exampleCollections?.[0]
    );
    const { example, publicExample } = buildBothExamples(
        strategyKey,
        schemaValue,
        schemaTemplate,
        tableTemplate,
        skipCommonDefaults,
        matchSourceTemplatesEnabled,
        srcSchema,
        srcTable,
        sourceName
    );

    const isKeyValid = isStrategyKeyValid(strategyKey);
    const canSubmitForm = isStrategyValid(strategyKey, schemaValue);

    const sharedSchemaInputProps = {
        field: 'schema' as const,
        value: schemaValue,
        onChange: setSchemaValue,
        templateAllowed: false,
    };

    const sharedTableInputProps = {
        field: 'table' as const,
        tokenString: example.sourceTable,
        value: tableValue,
        onChange: setTableValue,
        templateAllowed: true,
    };

    return {
        strategyKey,
        setStrategyKey,
        schemaValue,
        setSchemaValue,
        skipCommonDefaults,
        setSkipCommonDefaults,
        matchSourceTemplatesEnabled,
        setMatchSourceTemplatesEnabled,
        tableValue,
        setTableValue,
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
