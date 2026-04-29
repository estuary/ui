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
    buildExample,
    hasSchemaTemplate,
    hasTableTemplate,
    parseSchemaTemplate,
    parseTableTemplate,
    SCHEMA_TEMPLATE_STRING,
    TABLE_TEMPLATE_STRING,
} from 'src/components/materialization/targetNaming/shared';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import { TemplateInput } from 'src/components/materialization/targetNaming/TemplateInput';

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
    const [showMatchNaming, setShowMatchNaming] = useState(
        initialStrategy?.strategy === 'matchSourceStructure' &&
            (hasSchemaTemplate(initialStrategy) ||
                hasTableTemplate(initialStrategy))
    );

    const [schemaMode, setSchemaMode] = useState<'fixed' | 'template'>(
        'template'
    );
    const parsedSchemaTemplate = hasSchemaTemplate(initialStrategy)
        ? parseSchemaTemplate(initialStrategy.schemaTemplate)
        : { prefix: '', suffix: '' };
    const [schemaPrefix, setSchemaPrefix] = useState(
        parsedSchemaTemplate.prefix
    );
    const [schemaSuffix, setSchemaSuffix] = useState(
        parsedSchemaTemplate.suffix
    );

    const schemaTemplate =
        schemaMode === 'template'
            ? `${schemaPrefix}${SCHEMA_TEMPLATE_STRING}${schemaSuffix}`
            : undefined;

    const [tableMode, setTableMode] = useState<'fixed' | 'template'>(
        'template'
    );
    const parsedTableTemplate = hasTableTemplate(initialStrategy)
        ? parseTableTemplate(initialStrategy.tableTemplate)
        : { prefix: '', suffix: '' };
    const [tablePrefix, setTablePrefix] = useState(parsedTableTemplate.prefix);
    const [tableSuffix, setTableSuffix] = useState(parsedTableTemplate.suffix);
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

    const schemaRequired = strategyKey !== 'matchSourceStructure';
    const schemaProvided =
        schemaMode === 'template' ? true : schema.trim().length > 0;
    const isValid = !schemaRequired || schemaProvided;

    const exampleSchemaTemplate =
        strategyKey !== 'matchSourceStructure' || showMatchNaming
            ? schemaTemplate
            : undefined;
    const exampleTableTemplate =
        strategyKey !== 'matchSourceStructure' || showMatchNaming
            ? tableTemplate
            : undefined;

    const firstCollection = exampleCollections?.[0];
    const collectionParts = firstCollection?.split('/') ?? [];
    const srcSchema =
        collectionParts.length >= 2
            ? (collectionParts[collectionParts.length - 2] ?? 'anvils')
            : 'anvils';
    const srcTable =
        collectionParts.length >= 1
            ? (collectionParts[collectionParts.length - 1] ?? 'orders')
            : 'orders';
    const sourceName = firstCollection;

    const example = buildExample(
        strategyKey,
        schema,
        exampleSchemaTemplate,
        exampleTableTemplate,
        skipCommonDefaults,
        srcSchema,
        srcTable,
        sourceName
    );
    const publicExample = buildExample(
        strategyKey,
        schema,
        exampleSchemaTemplate,
        exampleTableTemplate,
        skipCommonDefaults,
        'public',
        srcTable,
        sourceName
            ? sourceName.replace(`/${srcSchema}/`, '/public/')
            : undefined
    );

    useEffect(() => {
        let strategy: TargetNamingStrategy;
        if (strategyKey === 'matchSourceStructure') {
            strategy = {
                strategy: 'matchSourceStructure',
            };

            if (showMatchNaming) {
                if (schemaTemplate) {
                    strategy.schemaTemplate = schemaTemplate;
                }

                if (tableTemplate) {
                    strategy.tableTemplate = tableTemplate;
                }
            }
        } else if (strategyKey === 'singleSchema') {
            strategy = {
                strategy: 'singleSchema',
                schema: schema.trim(),
            };

            if (tableTemplate) {
                strategy.tableTemplate = tableTemplate;
            }
        } else {
            strategy = {
                strategy: 'prefixTableNames',
                schema: schema.trim(),
                skipCommonDefaults,
            };

            if (tableTemplate) {
                strategy.tableTemplate = tableTemplate;
            }
        }
        onChange(strategy, isValid);
        // onChange identity is intentionally excluded — callers should stabilise it
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        strategyKey,
        schema,
        skipCommonDefaults,
        showMatchNaming,
        schemaMode,
        schemaPrefix,
        schemaSuffix,
        tableMode,
        tablePrefix,
        tableSuffix,
        tableValue,
        isValid,
    ]);

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({
                    id: 'destinationLayout.dialog.subtitle',
                })}
            </Typography>

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
                                            checked={showMatchNaming}
                                            onChange={(e) =>
                                                setShowMatchNaming(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label={intl.formatMessage({
                                        id: 'destinationLayout.dialog.matchSourceStructure.customize',
                                    })}
                                />
                                {showMatchNaming ? (
                                    <Stack spacing={1}>
                                        <TemplateInput
                                            tokenString={example.schema}
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
                                            tokenString={example.table}
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
                                    tokenString={example.table}
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
                                    tokenString={example.table}
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
