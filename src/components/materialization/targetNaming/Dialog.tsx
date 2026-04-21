import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import {
    Box,
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

import { SchemaInput } from 'src/components/materialization/targetNaming/SchemaInput';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

interface Props {
    open: boolean;
    // Initial strategy to pre-populate the form (used when re-opening to change).
    initialStrategy?: TargetNamingStrategy | null;
    onCancel: () => void;
    onConfirm: (strategy: TargetNamingStrategy) => void;
}

function hasSchemaTemplate(
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

function parseSchemaTemplate(template: string): {
    prefix: string;
    suffix: string;
} {
    const parts = template.split('{{schema}}');
    return { prefix: parts[0] ?? '', suffix: parts[1] ?? '' };
}

// Derives example schema/table names from a strategy, user-entered schema, and a source schema name.
function buildExample(
    strategyKey: StrategyKey,
    schema: string,
    schemaTemplate: string | undefined,
    skipCommonDefaults: boolean,
    srcSchema: string = 'mySchema'
): { schema: string; table: string; tablePrefix: string } {
    const srcTable = 'orders';

    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace('{{schema}}', srcSchema)
            : fallback || '...';

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

export default function DestinationLayoutDialog({
    open,
    initialStrategy,
    onCancel,
    onConfirm,
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

    // Template mode state
    const [schemaMode, setSchemaMode] = useState<'fixed' | 'template'>(
        hasSchemaTemplate(initialStrategy) ? 'template' : 'fixed'
    );
    const parsedTemplate = hasSchemaTemplate(initialStrategy)
        ? parseSchemaTemplate(initialStrategy.schemaTemplate)
        : { prefix: '', suffix: '' };
    const [schemaPrefix, setSchemaPrefix] = useState(parsedTemplate.prefix);
    const [schemaSuffix, setSchemaSuffix] = useState(parsedTemplate.suffix);

    const schemaTemplate =
        schemaMode === 'template'
            ? `${schemaPrefix}{{schema}}${schemaSuffix}`
            : undefined;

    const schemaRequired = strategyKey !== 'matchSourceStructure';
    const schemaProvided =
        schemaMode === 'template' ? true : schema.trim().length > 0;
    const canConfirm = !schemaRequired || schemaProvided;

    const handleConfirm = () => {
        if (!canConfirm) return;

        let strategy: TargetNamingStrategy;
        if (strategyKey === 'matchSourceStructure') {
            strategy = { strategy: 'matchSourceStructure' };
        } else if (strategyKey === 'singleSchema') {
            strategy = schemaTemplate
                ? { strategy: 'singleSchema', schemaTemplate }
                : { strategy: 'singleSchema', schema: schema.trim() };
        } else {
            strategy = schemaTemplate
                ? {
                      strategy: 'prefixTableNames',
                      schemaTemplate,
                      skipCommonDefaults,
                  }
                : {
                      strategy: 'prefixTableNames',
                      schema: schema.trim(),
                      skipCommonDefaults,
                  };
        }

        onConfirm(strategy);
    };

    const example = buildExample(
        strategyKey,
        schema,
        schemaTemplate,
        skipCommonDefaults
    );
    const publicExample = buildExample(
        strategyKey,
        schema,
        schemaTemplate,
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
                            onSelect={() =>
                                setStrategyKey('matchSourceStructure')
                            }
                            example={example}
                            publicExample={publicExample}
                        />

                        <StrategyOption
                            value="singleSchema"
                            selected={strategyKey === 'singleSchema'}
                            onSelect={() => setStrategyKey('singleSchema')}
                            example={example}
                            publicExample={publicExample}
                        >
                            {strategyKey === 'singleSchema' ? (
                                <Box onClick={(e) => e.stopPropagation()}>
                                    <SchemaInput
                                        mode={schemaMode}
                                        onModeChange={setSchemaMode}
                                        value={schema}
                                        onChange={setSchema}
                                        prefix={schemaPrefix}
                                        onPrefixChange={setSchemaPrefix}
                                        suffix={schemaSuffix}
                                        onSuffixChange={setSchemaSuffix}
                                    />
                                </Box>
                            ) : null}
                        </StrategyOption>

                        <StrategyOption
                            value="prefixTableNames"
                            selected={strategyKey === 'prefixTableNames'}
                            onSelect={() => setStrategyKey('prefixTableNames')}
                            example={example}
                            publicExample={publicExample}
                        >
                            {strategyKey === 'prefixTableNames' ? (
                                <Stack
                                    spacing={1}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SchemaInput
                                        mode={schemaMode}
                                        onModeChange={setSchemaMode}
                                        value={schema}
                                        onChange={setSchema}
                                        prefix={schemaPrefix}
                                        onPrefixChange={setSchemaPrefix}
                                        suffix={schemaSuffix}
                                        onSuffixChange={setSchemaSuffix}
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
                        id: 'destinationLayout.dialog.cta.addBindings',
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
