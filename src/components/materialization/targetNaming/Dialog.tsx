import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
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
} from 'src/components/materialization/targetNaming/shared';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import { TemplateInput } from 'src/components/materialization/targetNaming/TemplateInput';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

interface Props {
    open: boolean;
    onCancel: () => void;
    onConfirm: (strategy: TargetNamingStrategy) => void;
    confirmIntlKey: string;
    initialStrategy?: TargetNamingStrategy | null;
}

export default function TargetNamingDialog({
    open,
    initialStrategy,
    onCancel,
    onConfirm,
    confirmIntlKey,
}: Props) {
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

    // Only show prefix/suffix inputs for matchSourceStructure if the initial
    // strategy already had a non-trivial template, or the user enables it.
    const [showMatchNaming, setShowMatchNaming] = useState(
        initialStrategy?.strategy === 'matchSourceStructure' &&
            (hasSchemaTemplate(initialStrategy) ||
                (hasTableTemplate(initialStrategy) &&
                    initialStrategy.tableTemplate !== '{{table}}'))
    );

    // Schema template state
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
            ? `${schemaPrefix}{{schema}}${schemaSuffix}`
            : undefined;

    // Table template state
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
            ? `${tablePrefix}{{table}}${tableSuffix}`
            : tableValue.trim() || undefined;

    const schemaRequired = strategyKey !== 'matchSourceStructure';
    const schemaProvided =
        schemaMode === 'template' ? true : schema.trim().length > 0;
    const canConfirm = !schemaRequired || schemaProvided;

    const handleConfirm = () => {
        if (!canConfirm) return;

        let strategy: TargetNamingStrategy;
        if (strategyKey === 'matchSourceStructure') {
            strategy = {
                strategy: 'matchSourceStructure',
                schemaTemplate: showMatchNaming ? schemaTemplate : '{{schema}}',
                tableTemplate: showMatchNaming ? tableTemplate : '{{template}}',
            };
        } else if (strategyKey === 'singleSchema') {
            strategy = {
                strategy: 'singleSchema',
                schema: schema.trim(),
                tableTemplate,
            };
        } else {
            strategy = {
                strategy: 'prefixTableNames',
                schema: schema.trim(),
                skipCommonDefaults,
                tableTemplate,
            };
        }

        onConfirm(strategy);
    };

    const exampleSchemaTemplate =
        strategyKey !== 'matchSourceStructure' || showMatchNaming
            ? schemaTemplate
            : undefined;
    const exampleTableTemplate =
        strategyKey !== 'matchSourceStructure' || showMatchNaming
            ? tableTemplate
            : undefined;

    const example = buildExample(
        strategyKey,
        schema,
        exampleSchemaTemplate,
        exampleTableTemplate,
        skipCommonDefaults
    );
    const publicExample = buildExample(
        strategyKey,
        schema,
        exampleSchemaTemplate,
        exampleTableTemplate,
        skipCommonDefaults,
        'public'
    );

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitleWithClose
                id="destination-layout-dialog-title"
                onClose={onCancel}
            >
                {intl.formatMessage({ id: 'destinationLayout.dialog.title' })}
            </DialogTitleWithClose>

            <DialogContent>
                <Typography variant="body2" sx={{ mb: 3 }}>
                    {intl.formatMessage({
                        id: 'destinationLayout.dialog.subtitle',
                    })}
                </Typography>

                <RadioGroup
                    value={strategyKey}
                    onChange={(e) =>
                        setStrategyKey(e.target.value as StrategyKey)
                    }
                >
                    <Stack spacing={2}>
                        <StrategyOption
                            value="matchSourceStructure"
                            selected={strategyKey === 'matchSourceStructure'}
                            onSelect={() => {
                                if (strategyKey === 'matchSourceStructure') {
                                    return;
                                }

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
                                if (strategyKey === 'singleSchema') {
                                    return;
                                }

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
                                if (strategyKey === 'prefixTableNames') {
                                    return;
                                }

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
                                        mode={tableMode}
                                        // onModeChange={setTableMode}
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
            </DialogContent>

            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                >
                    {intl.formatMessage({
                        id: confirmIntlKey,
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
