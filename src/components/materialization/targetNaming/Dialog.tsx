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

import OptionExample from 'src/components/materialization/source/targetSchema/OptionExample';
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
import PreformattedBlock from 'src/components/shared/PreformattedBlock';

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

    // Schema template state
    const [schemaMode, setSchemaMode] = useState<'fixed' | 'template'>(
        hasSchemaTemplate(initialStrategy) ? 'template' : 'fixed'
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
        hasTableTemplate(initialStrategy) ? 'template' : 'fixed'
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
                schemaTemplate,
                tableTemplate,
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
        strategyKey === 'matchSourceStructure' ? schemaTemplate : undefined;
    const exampleTableTemplate =
        strategyKey === 'matchSourceStructure' ? tableTemplate : undefined;

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
                                setSchemaMode('fixed');
                                setTableMode('fixed');
                                setStrategyKey('matchSourceStructure');
                            }}
                        />
                        <StrategyOption
                            value="singleSchema"
                            selected={strategyKey === 'singleSchema'}
                            onSelect={() => {
                                setSchemaMode('fixed');
                                setTableMode('fixed');
                                setStrategyKey('singleSchema');
                            }}
                        />
                        <StrategyOption
                            value="prefixTableNames"
                            selected={strategyKey === 'prefixTableNames'}
                            onSelect={() => {
                                setSchemaMode('fixed');
                                setTableMode('fixed');
                                setStrategyKey('prefixTableNames');
                            }}
                        />
                    </Stack>
                </RadioGroup>

                <Box
                    sx={{
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        p: 1.5,
                        mt: 2,
                    }}
                >
                    <Stack spacing={2} sx={{ mt: 3 }}>
                        <TemplateInput
                            hideWhenFixed={
                                strategyKey !== 'matchSourceStructure'
                            }
                            mode={schemaMode}
                            onModeChange={setSchemaMode}
                            required={schemaRequired}
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
                            onModeChange={setTableMode}
                            value={tableValue}
                            onChange={setTableValue}
                            prefix={tablePrefix}
                            onPrefixChange={setTablePrefix}
                            suffix={tableSuffix}
                            onSuffixChange={setTableSuffix}
                        />

                        {strategyKey === 'prefixTableNames' ? (
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
                        ) : null}
                    </Stack>
                </Box>

                <PreformattedBlock>
                    <Stack spacing={0.5}>
                        <Typography>
                            {intl.formatMessage({
                                id: 'common.examples',
                            })}
                        </Typography>
                        <OptionExample
                            example={example}
                            baseTableMessageID="schemaMode.example.base"
                        />
                        {publicExample ? (
                            <OptionExample
                                example={publicExample}
                                baseTableMessageID="schemaMode.example.base"
                            />
                        ) : null}
                    </Stack>
                </PreformattedBlock>
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
                    {intl.formatMessage({ id: confirmIntlKey })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
