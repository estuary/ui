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
    Link,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

interface Props {
    open: boolean;
    // Initial strategy to pre-populate the form (used when re-opening to change).
    initialStrategy?: TargetNamingStrategy | null;
    onCancel: () => void;
    onConfirm: (strategy: TargetNamingStrategy) => void;
}

type StrategyKey = TargetNamingStrategy['strategy'];

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
): { schema: string; table: string } {
    const srcTable = 'orders';

    const resolveSchema = (fallback: string) =>
        schemaTemplate
            ? schemaTemplate.replace('{{schema}}', srcSchema)
            : fallback || '...';

    switch (strategyKey) {
        case 'matchSourceStructure':
            return { schema: srcSchema, table: srcTable };
        case 'singleSchema':
            return { schema: resolveSchema(schema), table: srcTable };
        case 'prefixTableNames': {
            const isDefault = ['public', 'dbo'].includes(srcSchema);
            const prefix =
                skipCommonDefaults && isDefault ? '' : `${srcSchema}_`;
            return {
                schema: resolveSchema(schema),
                table: `${prefix}${srcTable}`,
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
    // Second example using 'public' source schema so users can see skip-common-defaults in action.
    // Only meaningful for prefixTableNames.
    const publicExample =
        strategyKey === 'prefixTableNames'
            ? buildExample(
                  strategyKey,
                  schema,
                  schemaTemplate,
                  skipCommonDefaults,
                  'public'
              )
            : undefined;

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
                        {/* Match source structure */}
                        <StrategyOption
                            value="matchSourceStructure"
                            selected={strategyKey === 'matchSourceStructure'}
                            onSelect={() =>
                                setStrategyKey('matchSourceStructure')
                            }
                            label={intl.formatMessage({
                                id: 'destinationLayout.strategy.matchSourceStructure.label',
                            })}
                            description={intl.formatMessage({
                                id: 'destinationLayout.strategy.matchSourceStructure.description',
                            })}
                            example={example}
                            showExample={strategyKey === 'matchSourceStructure'}
                        />

                        {/* All tables in one schema */}
                        <StrategyOption
                            value="singleSchema"
                            selected={strategyKey === 'singleSchema'}
                            onSelect={() => setStrategyKey('singleSchema')}
                            label={intl.formatMessage({
                                id: 'destinationLayout.strategy.singleSchema.label',
                            })}
                            description={intl.formatMessage({
                                id: 'destinationLayout.strategy.singleSchema.description',
                            })}
                            example={example}
                            showExample={strategyKey === 'singleSchema'}
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

                        {/* Prefix table names */}
                        <StrategyOption
                            value="prefixTableNames"
                            selected={strategyKey === 'prefixTableNames'}
                            onSelect={() => setStrategyKey('prefixTableNames')}
                            label={intl.formatMessage({
                                id: 'destinationLayout.strategy.prefixTableNames.label',
                            })}
                            description={intl.formatMessage({
                                id: 'destinationLayout.strategy.prefixTableNames.description',
                            })}
                            example={example}
                            publicExample={publicExample}
                            showExample={strategyKey === 'prefixTableNames'}
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

interface StrategyOptionProps {
    value: StrategyKey;
    selected: boolean;
    onSelect: () => void;
    label: string;
    description: string;
    example: { schema: string; table: string };
    // Second example using 'public' source schema, shown alongside the main example.
    publicExample?: { schema: string; table: string };
    showExample: boolean;
    children?: React.ReactNode;
}

function StrategyOption({
    value,
    selected,
    onSelect,
    label,
    description,
    example,
    publicExample,
    showExample,
    children,
}: StrategyOptionProps) {
    return (
        <Box
            onClick={onSelect}
            sx={{
                border: (theme) =>
                    `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 1,
                cursor: 'pointer',
                p: 1.5,
            }}
        >
            <FormControlLabel
                value={value}
                control={<Radio size="small" />}
                label={<Typography fontWeight={500}>{label}</Typography>}
                sx={{ mb: 0.5, pointerEvents: 'none' }}
            />
            <Box sx={{ pl: 4 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {description}
                </Typography>

                {children}

                {showExample ? (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                        <ExampleBlock
                            collectionId="destinationLayout.example.collection"
                            example={example}
                        />
                        {publicExample ? (
                            <ExampleBlock
                                collectionId="destinationLayout.example.collection.public"
                                example={publicExample}
                            />
                        ) : null}
                    </Stack>
                ) : null}
            </Box>
        </Box>
    );
}

interface ExampleBlockProps {
    collectionId: string;
    example: { schema: string; table: string };
}

function ExampleBlock({ collectionId, example }: ExampleBlockProps) {
    const intl = useIntl();

    return (
        <Box
            sx={{
                flex: 1,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
            >
                {intl.formatMessage({ id: collectionId })}
            </Typography>
            <Box
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                }}
            >
                <Box
                    component="span"
                    sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                    {example.schema}
                </Box>
                <Box component="span" sx={{ color: 'text.disabled' }}>
                    .
                </Box>
                <Box component="span">{example.table}</Box>
            </Box>
        </Box>
    );
}

interface SchemaInputProps {
    mode: 'fixed' | 'template';
    onModeChange: (mode: 'fixed' | 'template') => void;
    value: string;
    onChange: (value: string) => void;
    prefix: string;
    onPrefixChange: (v: string) => void;
    suffix: string;
    onSuffixChange: (v: string) => void;
}

function SchemaInput({
    mode,
    onModeChange,
    value,
    onChange,
    prefix,
    onPrefixChange,
    suffix,
    onSuffixChange,
}: SchemaInputProps) {
    const intl = useIntl();

    return (
        <Stack spacing={0.5}>
            {mode === 'fixed' ? (
                <TextField
                    size="small"
                    label={intl.formatMessage({
                        id: 'destinationLayout.dialog.schema.label',
                    })}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="prod"
                    sx={{ maxWidth: 200 }}
                    autoFocus
                />
            ) : (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <TextField
                        size="small"
                        label={intl.formatMessage({
                            id: 'destinationLayout.dialog.schema.prefix.label',
                        })}
                        value={prefix}
                        onChange={(e) => onPrefixChange(e.target.value)}
                        placeholder="prod_"
                        sx={{ maxWidth: 120 }}
                        autoFocus
                    />
                    <TextField
                        size="small"
                        label={intl.formatMessage({
                            id: 'destinationLayout.dialog.schema.suffix.label',
                        })}
                        value={suffix}
                        onChange={(e) => onSuffixChange(e.target.value)}
                        placeholder="_v2"
                        sx={{ maxWidth: 120 }}
                    />
                </Stack>
            )}
            <Box>
                <Link
                    component="button"
                    variant="caption"
                    onClick={() =>
                        onModeChange(mode === 'fixed' ? 'template' : 'fixed')
                    }
                >
                    {mode === 'fixed'
                        ? intl.formatMessage({
                              id: 'destinationLayout.dialog.schema.useTemplate',
                          })
                        : intl.formatMessage({
                              id: 'destinationLayout.dialog.schema.useFixed',
                          })}
                </Link>
            </Box>
        </Stack>
    );
}
