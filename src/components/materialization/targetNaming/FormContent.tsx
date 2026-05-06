import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';
import type { TargetNamingStrategy } from 'src/types';

import { useEffect } from 'react';

import {
    Checkbox,
    FormControlLabel,
    RadioGroup,
    Stack,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { buildStrategyFromState } from 'src/components/materialization/targetNaming/shared';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import { TemplateInput } from 'src/components/materialization/targetNaming/TemplateInput';
import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';
import { useTargetNamingFormState } from 'src/hooks/materialization/useTargetNamingFormState';

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

    const {
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
    } = useTargetNamingFormState(initialStrategy, exampleCollections);

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
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={
                                                matchSourceTemplatesEnabled
                                            }
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setMatchSourceTemplatesEnabled(
                                                    e.target.checked
                                                );
                                            }}
                                        />
                                    }
                                    label={intl.formatMessage({
                                        id: 'destinationLayout.dialog.matchSourceStructure.customize',
                                    })}
                                />
                                {matchSourceTemplatesEnabled ? (
                                    <Stack spacing={1}>
                                        <TemplateInput
                                            {...sharedSchemaInputProps}
                                            tokenString={example.sourceSchema}
                                        />
                                        <TemplateInput
                                            {...sharedTableInputProps}
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
                                    {...sharedSchemaInputProps}
                                    mode="fixed"
                                    required
                                />
                                <TemplateInput {...sharedTableInputProps} />
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
                            <Stack spacing={1}>
                                <TemplateInput
                                    {...sharedSchemaInputProps}
                                    required
                                />
                                <TemplateInput {...sharedTableInputProps} />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={skipCommonDefaults}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSkipCommonDefaults(
                                                    e.target.checked
                                                );
                                            }}
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
