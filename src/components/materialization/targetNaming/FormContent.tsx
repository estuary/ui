import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useEffect, useState } from 'react';

import {
    Checkbox,
    FormControlLabel,
    RadioGroup,
    Stack,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import {
    buildBothExamples,
    buildStrategyFromState,
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
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import { TemplateInput } from 'src/components/materialization/targetNaming/TemplateInput';
import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';

export interface TargetNamingFormContentProps {
    initialStrategy?: TargetNamingStrategy | null;
    onChange: (strategy: TargetNamingStrategy, isValid: boolean) => void;
    exampleCollections?: string[];
}

export function TargetNamingFormContent({
    initialStrategy,
    onChange,
    exampleCollections,
}: TargetNamingFormContentProps) {
    const intl = useIntl();

    // Option that is currently selected
    const [strategyKey, setStrategyKey] = useState<StrategyKey>(
        initialStrategy?.strategy ?? 'matchSourceStructure'
    );

    // The value of the schema input (template and fixed)
    const [schema, setSchema] = useState<string>(
        initialStrategy && initialStrategy.strategy !== 'matchSourceStructure'
            ? (initialStrategy.schema ?? '')
            : ''
    );

    // Checkbox just for "Prefix Table" options
    const [skipCommonDefaults, setSkipCommonDefaults] = useState<boolean>(
        initialStrategy?.strategy === 'prefixTableNames'
            ? (initialStrategy.skipCommonDefaults ?? true)
            : true
    );

    // Checkbox just for "Match source" options so both templates are behind a
    //  single input. Showing each template individually felt weird to me.
    const [matchSourceTemplatesEnabled, setMatchSourceTemplatesEnabled] =
        useState(
            initialStrategy?.strategy === 'matchSourceStructure' &&
                (hasSchemaTemplate(initialStrategy) ||
                    hasTableTemplate(initialStrategy))
        );

    // Handling the schema template stuff
    const [schemaMode, setSchemaMode] = useState<'fixed' | 'template'>(
        'template'
    );
    const parsedSchema = parseSchemaTemplate(initialStrategy);
    const [schemaPrefix, setSchemaPrefix] = useState(parsedSchema.prefix);
    const [schemaSuffix, setSchemaSuffix] = useState(parsedSchema.suffix);
    const schemaTemplate =
        schemaMode === 'template'
            ? `${schemaPrefix}${SCHEMA_TEMPLATE_STRING}${schemaSuffix}`
            : undefined;

    // Handling the table template stuff
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

    // Generate examples for each option
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

    // Validation
    const isKeyValid = isStrategyKeyValid(strategyKey);
    const canSubmitForm = isStrategyValid(strategyKey, schemaMode, schema);

    // Keeping everything updated
    useEffect(() => {
        const strategy = buildStrategyFromState(
            strategyKey,
            schema,
            skipCommonDefaults,
            matchSourceTemplatesEnabled,
            schemaTemplate,
            tableTemplate
        );
        onChange(strategy, canSubmitForm);
    }, [
        strategyKey,
        schema,
        skipCommonDefaults,
        matchSourceTemplatesEnabled,
        schemaMode,
        schemaPrefix,
        schemaSuffix,
        tableMode,
        tablePrefix,
        tableSuffix,
        tableValue,
        canSubmitForm,
        schemaTemplate,
        tableTemplate,
        onChange,
    ]);

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({
                    id: 'destinationLayout.dialog.subtitle',
                })}
            </Typography>

            {!isKeyValid ? (
                <SpecPropInvalidSetting
                    currentSetting={strategyKey}
                    invalidSettingsMessageId="specPropUpdater.error.message.withRemove"
                />
            ) : null}

            <RadioGroup
                value={strategyKey}
                onChange={(e) => setStrategyKey(e.target.value as StrategyKey)}
            >
                <Stack spacing={2}>
                    <StrategyOption
                        value="matchSourceStructure"
                        selected={strategyKey === 'matchSourceStructure'}
                        onSelect={() => {
                            if (strategyKey === 'matchSourceStructure') return;
                            setTableMode('template');
                            setSchemaMode('template');
                            setStrategyKey('matchSourceStructure');
                        }}
                        example={example}
                        publicExample={publicExample}
                    >
                        {strategyKey === 'matchSourceStructure' ? (
                            <Stack
                                spacing={1}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={
                                                matchSourceTemplatesEnabled
                                            }
                                            onChange={(e) =>
                                                setMatchSourceTemplatesEnabled(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label={intl.formatMessage({
                                        id: 'destinationLayout.dialog.matchSourceStructure.customize',
                                    })}
                                />
                                {matchSourceTemplatesEnabled ? (
                                    <Stack spacing={1}>
                                        <TemplateInput
                                            tokenString={example.sourceSchema}
                                            mode={schemaMode}
                                            value={schema}
                                            onChange={setSchema}
                                            prefix={schemaPrefix}
                                            onPrefixChange={setSchemaPrefix}
                                            suffix={schemaSuffix}
                                            onSuffixChange={setSchemaSuffix}
                                        />
                                        <TemplateInput
                                            field="table"
                                            tokenString={example.sourceTable}
                                            mode={tableMode}
                                            value={tableValue}
                                            onChange={setTableValue}
                                            prefix={tablePrefix}
                                            onPrefixChange={setTablePrefix}
                                            suffix={tableSuffix}
                                            onSuffixChange={setTableSuffix}
                                        />
                                    </Stack>
                                ) : null}
                            </Stack>
                        ) : null}
                    </StrategyOption>

                    <StrategyOption
                        value="singleSchema"
                        selected={strategyKey === 'singleSchema'}
                        onSelect={() => {
                            if (strategyKey === 'singleSchema') return;
                            setTableMode('template');
                            setSchemaMode('fixed');
                            setStrategyKey('singleSchema');
                        }}
                        example={example}
                        publicExample={publicExample}
                    >
                        {strategyKey === 'singleSchema' ? (
                            <Stack
                                spacing={1}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <TemplateInput
                                    mode="fixed"
                                    required
                                    value={schema}
                                    onChange={setSchema}
                                    prefix={schemaPrefix}
                                    onPrefixChange={setSchemaPrefix}
                                    suffix={schemaSuffix}
                                    onSuffixChange={setSchemaSuffix}
                                />
                                <TemplateInput
                                    hideWhenFixed
                                    field="table"
                                    tokenString={example.sourceTable}
                                    mode={tableMode}
                                    value={tableValue}
                                    onChange={setTableValue}
                                    prefix={tablePrefix}
                                    onPrefixChange={setTablePrefix}
                                    suffix={tableSuffix}
                                    onSuffixChange={setTableSuffix}
                                />
                            </Stack>
                        ) : null}
                    </StrategyOption>

                    <StrategyOption
                        value="prefixTableNames"
                        selected={strategyKey === 'prefixTableNames'}
                        onSelect={() => {
                            if (strategyKey === 'prefixTableNames') return;
                            setSchemaMode('fixed');
                            setTableMode('template');
                            setStrategyKey('prefixTableNames');
                        }}
                        example={example}
                        publicExample={publicExample}
                    >
                        {strategyKey === 'prefixTableNames' ? (
                            <Stack
                                spacing={1}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <TemplateInput
                                    mode={schemaMode}
                                    required
                                    value={schema}
                                    onChange={setSchema}
                                    prefix={schemaPrefix}
                                    onPrefixChange={setSchemaPrefix}
                                    suffix={schemaSuffix}
                                    onSuffixChange={setSchemaSuffix}
                                />
                                <TemplateInput
                                    hideWhenFixed
                                    field="table"
                                    tokenString={example.sourceTable}
                                    mode={tableMode}
                                    value={tableValue}
                                    onChange={setTableValue}
                                    prefix={tablePrefix}
                                    onPrefixChange={setTablePrefix}
                                    suffix={tableSuffix}
                                    onSuffixChange={setTableSuffix}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={skipCommonDefaults}
                                            onChange={(e) =>
                                                setSkipCommonDefaults(
                                                    e.target.checked
                                                )
                                            }
                                            size="small"
                                        />
                                    }
                                    label={intl.formatMessage({
                                        id: 'destinationLayout.dialog.skipCommonDefaults.label',
                                    })}
                                />
                            </Stack>
                        ) : null}
                    </StrategyOption>
                </Stack>
            </RadioGroup>
        </Stack>
    );
}
