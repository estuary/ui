import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useRef } from 'react';

import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { InfoCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import SelectorOption from 'src/components/materialization/source/targetSchema/SelectorOption';
import SpecPropAutoComplete from 'src/components/shared/specPropEditor/SpecPropAutoComplete';
import { useEntityWorkflow } from 'src/context/Workflow';
import useTargetSchemaOptions from 'src/hooks/sourceCapture/useTargetSchemaOptions';
import { compareOptionsIncludingAliases } from 'src/stores/SourceCapture/shared';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function TargetSchemaForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const intl = useIntl();
    const theme = useTheme();

    const workflow = useEntityWorkflow();

    const [setTargetSchemaHasError, setTargetSchema] = useSourceCaptureStore(
        (state) => [state.setTargetSchemaHasError, state.setTargetSchema]
    );

    const options = useTargetSchemaOptions();

    useMount(() => {
        if (workflow === 'materialization_create') {
            setTargetSchema('withSchema');
        }
    });

    // If we are editing make sure we store the current value into the store "on load"
    const defaultValue = useRef(workflow === 'materialization_edit');
    useEffect(() => {
        if (defaultValue.current) {
            if (currentSetting) {
                setTargetSchema(currentSetting);
                defaultValue.current = false;
            }
        }
    }, [currentSetting, setTargetSchema]);

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                style={{ alignItems: 'center', marginBottom: 12 }}
            >
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage({ id: 'schemaMode.input.label' })}
                </Typography>

                <Tooltip
                    placement="right"
                    title={intl.formatMessage({
                        id: 'schemaMode.message',
                    })}
                >
                    <InfoCircle
                        style={{
                            color: theme.palette.text.primary,
                            fontSize: 12,
                        }}
                    />
                </Tooltip>
            </Stack>

            <SpecPropAutoComplete
                currentSetting={currentSetting}
                options={options}
                scope={scope}
                isOptionEqualToValue={compareOptionsIncludingAliases}
                renderOption={(
                    renderOptionProps,
                    option: AutoCompleteOptionForTargetSchema
                ) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                }}
                updateDraftedSetting={updateDraftedSetting}
                setErrorExists={(errorExists) => {
                    setTargetSchemaHasError(errorExists);
                }}
                sx={{
                    maxWidth: 700,
                }}
            />
        </Box>
    );
}
