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

import {
    buildStrategyFromState,
    SCHEMA_TEMPLATE_STRING,
    TABLE_TEMPLATE_STRING,
} from 'src/components/materialization/targetNaming/shared';
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

    const prefillTemplates = (
        currentSchema: string,
        setSchema: (v: string) => void,
        currentTable: string,
        setTable: (v: string) => void
    ) => {
        if (!currentSchema.includes(SCHEMA_TEMPLATE_STRING)) {
            setSchema(SCHEMA_TEMPLATE_STRING);
        }
        if (!currentTable.includes(TABLE_TEMPLATE_STRING)) {
            setTable(TABLE_TEMPLATE_STRING);
        }
    };

    const {
        canSubmitForm,
        example,
        isKeyValid,
        matchSourceTemplatesEnabled,
        publicExample,
        schemaValue,
        setMatchSourceTemplatesEnabled,
        setSchemaValue,
        setSkipCommonDefaults,
        setStrategyKey,
        setTableValue,
        sharedSchemaInputProps,
        sharedTableInputProps,
        skipCommonDefaults,
        strategyKey,
        tableValue,
    } = useTargetNamingFormState(initialStrategy, exampleCollections);

    useEffect(() => {
        const strategy = buildStrategyFromState(
            strategyKey,
            schemaValue,
            tableValue,
            skipCommonDefaults,
            matchSourceTemplatesEnabled
        );
        onChange(strategy, canSubmitForm);
    }, [
        strategyKey,
        schemaValue,
        tableValue,
        skipCommonDefaults,
        matchSourceTemplatesEnabled,
        canSubmitForm,
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
                            if (matchSourceTemplatesEnabled) {
                                prefillTemplates(
                                    schemaValue,
                                    setSchemaValue,
                                    tableValue,
                                    setTableValue
                                );
                            }
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
                                                if (e.target.checked) {
                                                    prefillTemplates(
                                                        schemaValue,
                                                        setSchemaValue,
                                                        tableValue,
                                                        setTableValue
                                                    );
                                                }
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
                                            templateAllowed={true}
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
                            if (strategyKey === 'matchSourceStructure') {
                                setSchemaValue('');
                            }
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
                                    templateAllowed={false}
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
                            if (strategyKey === 'matchSourceStructure') {
                                setSchemaValue('');
                            }
                            setStrategyKey('prefixTableNames');
                        }}
                        example={example}
                        publicExample={publicExample}
                    >
                        {strategyKey === 'prefixTableNames' ? (
                            <Stack spacing={1}>
                                <TemplateInput
                                    {...sharedSchemaInputProps}
                                    templateAllowed={false}
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
